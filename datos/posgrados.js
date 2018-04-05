const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const utils = require('../utils');

const addPosgrado = (posgrado) => {
  let table = model.Titulo.table;
  let query = table.insert(
                table.idMigracion.value(posgrado['CODIGO']),
                table.tipo.value(2),  // 2 es 'Posgrado'
                table.nombre.value(utils.checkString(posgrado['DESCRIPCION']))
              ).toQuery();

  return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando posgrados...');
    let q_objetos = `select CODIGO, DESCRIPCION from T_POSGRADOS where CODIGO between @offset and @limit`;
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_POSGRADOS';

    return utils.migrar(q_objetos, q_limites, 100, addPosgrado);
}
