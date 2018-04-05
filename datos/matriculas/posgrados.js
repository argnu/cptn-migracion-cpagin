const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

function getTitulo(idMigracion) {
  let table = model.Titulo.table;
  let query = table.select(
                table.id
              )
              .from(table)
              .where(
                table.tipo.equals(2).and(table.idMigracion.equals(idMigracion))
              )
              .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows[0]);
}

const addPosgrado = (formacion) => {
  return Promise.all([
    model.Matricula.getMigracion(formacion['ID']),
    getTitulo(formacion['POSGRADO'])
  ])
  .then(([matricula, titulo]) => {
    if (matricula && titulo) {
      let nuevaFormacion = {
        profesional: matricula.entidad,
        fecha: utils.getFecha(formacion['FECHA']),
        titulo: titulo.id,
        institucion: formacion['UNIVERSIDAD']
      };

      return model.Formacion.add(nuevaFormacion);
    }
  });
}

module.exports.migrar = function() {
    console.log('Migrando posgrados de matrículas...');
    let q_objetos = `select M.ID, M.POSGRADO, U.CODIGO as UNIVERSIDAD,
      dateadd(day, convert(integer, M.FECHA), '1800-12-28') as FECHA
      from MAT_POSG M
      LEFT JOIN T_UNIVERSIDAD U
      ON (M.UNIVERSIDAD = U.CODIGO)
      where ID between @offset and @limit`;
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_POSG';

    return utils.migrar(q_objetos, q_limites, 100, addPosgrado);
}
