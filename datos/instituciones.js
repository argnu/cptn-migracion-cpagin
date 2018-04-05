const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const utils = require('../utils');

const addInstitucion = (universidad) => {
  let table = model.Institucion.table;
  let query = table.insert(
                table.id.value(universidad['CODIGO']),
                table.nombre.value(utils.checkString(universidad['DESCRIPCION']))
              ).toQuery();

  return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando instituciones...');
    let q_objetos = 'select * from T_Universidad WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_Universidad';

    return utils.migrar(q_objetos, q_limites, 100, addInstitucion);
}
