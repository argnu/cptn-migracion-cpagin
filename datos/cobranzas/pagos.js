const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addTipoPago(tipo) {
  let habilitado = null;
  if (tipo['HABILITADO'] == 'Si') habilitado = 1;
  if (tipo['HABILITADO'] == 'No') habilitado = 0;
  let table = model.TipoPago.table;
  let query = table.insert(
                table.id.value(tipo['CODTIPOPAGO']),
                table.descripcion.value(utils.checkString(tipo['DESCRIPCION'])),
                table.cuentaContable.value(tipo['CUENTACONTABLE']),
                table.habilitado.value(habilitado)
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando tipo de pago...');
    let q_objetos = 'select * from T_TIPOPAGO WHERE CODTIPOPAGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODTIPOPAGO) as min, MAX(CODTIPOPAGO) as max from T_TIPOPAGO';

    return utils.migrar(q_objetos, q_limites, 100, addTipoPago);
}
