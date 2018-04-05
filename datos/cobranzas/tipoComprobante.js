const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addTipoComprobante(tipo) {
  let table = model.TipoComprobante.table;
  let query = table.insert(
                table.id.value(utils.checkString(tipo['ID'])),
                table.abreviatura.value(utils.checkString(tipo['Tipo_Doc'])),
                table.descripcion.value(utils.checkString(tipo['DESCRIPCION'])),
                table.cuentaAcreedora.value(tipo['CUENTAACREEDORA']),
                table.cuentaDeudora.value(tipo['CUENTADEUDORA']),
                table.cuentaADevengar.value(tipo['CUENTAADEVENGAR'])
              ).toQuery();

  return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando tipos de comprobantes...');
    // let q_objetos ='select * from T_TIPOASTO WHERE Tipo_Doc BETWEEN @offset AND @limit';
    let q_objetos ='select * from T_TIPOASTO';
    let q_limites = 'select 0 as min, COUNT(Tipo_Doc) as max from T_TIPOASTO';

    return utils.migrar(q_objetos, q_limites, 100, addTipoComprobante);
}
