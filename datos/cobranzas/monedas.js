const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addMoneda(moneda) {
  let table = model.TipoMoneda.table;
  let query = table.insert(
                table.id.value(moneda['CodMoneda']),
                table.nombre.value(utils.checkString(moneda['NombreMoneda'])),
                table.abreviatura.value(utils.checkString(moneda['Abreviatura'])),
                table.cambio.value(moneda['ValorCambio'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando monedas...');
    let q_objetos = 'select * from T_MONEDAS WHERE CodMoneda BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CodMoneda) as min, MAX(CodMoneda) as max from T_MONEDAS';

    return utils.migrar(q_objetos, q_limites, 100, addMoneda);
}
