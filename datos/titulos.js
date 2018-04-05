const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const utils = require('../utils');

const addTitulo = (titulo) => {
  let table = model.Titulo.table;
  let query = table.insert(
                table.idMigracion.value(titulo['CODIGO']),
                table.tipo.value(1),  // 1 es 'Grado'
                table.libro.value(utils.checkString(titulo['LIBRO'])),
                table.nombre.value(utils.checkString(titulo['DESCRIPCION']))
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function () {
    console.log('Migrando títulos...');
    let q_objetos = `select CODIGO, LIBRO, DESCRIPCION from T_TITULOS where CODIGO between @offset and @limit`;
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_TITULOS';

    return utils.migrar(q_objetos, q_limites, 100, addTitulo);
}
