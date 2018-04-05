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
                table.tipo.equals(1).and(table.idMigracion.equals(idMigracion))
              )
              .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows[0] );
}

const addFormacion = (formacion) => {
  return Promise.all([
    model.Matricula.getMigracion(formacion['ID']),
    getTitulo(formacion['TITULO'])
  ])
  .then(([matricula, titulo]) => {
    if (matricula && titulo) {
      let nuevaFormacion = {};
      nuevaFormacion.profesional = matricula.entidad;
      nuevaFormacion.fecha = utils.getFecha(formacion['FECHATITULO_DATE']);
      nuevaFormacion.titulo = titulo.id;
      nuevaFormacion.institucion = formacion['CODIGO'];
      return model.Formacion.add(nuevaFormacion);
    }
    else return Promise.resolve();
  });
}


module.exports.migrar = function() {
    console.log('Migrando titulos de matrículas...');
    let q_objetos = `select M.ID, M.CODUNIVERSIDAD,
      M.FECHATITULO_DATE, M.TITULO, U.CODIGO
      from MAT_TIT M
      LEFT JOIN T_UNIVERSIDAD U
      ON (M.CODUNIVERSIDAD = U.CODIGO)
      where TITULO > 0 AND ID between @offset and @limit`;
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_TIT';

    return utils.migrar(q_objetos, q_limites, 100, addFormacion);
}
