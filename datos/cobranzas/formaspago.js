const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addFormaPago(tipo) {
  let table = model.TipoFormaPago.table;
  let query = table.insert(
                table.id.value(tipo['CODIGOFORMAPAGO']),
                table.nombre.value(utils.checkString(tipo['NOMBREFORMAPAGO'])),
                table.cuenta.value(tipo['CUENTA']),
                table.moneda.value(tipo['CODMONEDA']),
                table.pago.value(tipo['TIPOPAGO']),
                table.senia.value(tipo['SENIA']),
                table.mutual.value(tipo['MUTUAL']),
                table.compensacion.value(tipo['Compensacion']),
                table.validoNCredito.value(tipo['validoNCredito'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando formas de pago...');
    let q_objetos = 'select * from T_FORMAPAGO WHERE CODIGOFORMAPAGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGOFORMAPAGO) as min, MAX(CODIGOFORMAPAGO) as max from T_FORMAPAGO';

    return utils.migrar(q_objetos, q_limites, 100, addFormaPago);
}
