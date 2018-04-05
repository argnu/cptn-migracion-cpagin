const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addBanco(banco) {
  let table = model.Banco.table;
  let query = table.insert(
                table.id.value(banco['CODIGO']),
                table.nombre.value(utils.checkString(banco['NOMBREBANCO'])),
                table.cuenta.value(banco['CUENTA'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando bancos...');
    let q_objetos = 'select * from T_BANCOS WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_BANCOS';

    return utils.migrar(q_objetos, q_limites, 100, addBanco);
}
