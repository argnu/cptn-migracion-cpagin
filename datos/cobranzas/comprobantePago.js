const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

function addPagos(pago) {
    return model.Comprobante.getByNumero(pago['NumRecibo'])
        .then(comprobante => {
            if (comprobante) {
                return model.ComprobantePago.add({
                    comprobante: comprobante.id,
                    item: pago['Item'],
                    fecha_pago: utils.getFecha(pago['FechaPago_DATE']),
                    importe: pago['Importe'],
                    forma_pago: pago['FormaPago'],
                    numero_cheque: pago['NroCheque'],
                    banco: pago['CodBanco'] ? pago['CodBanco'] : null,
                    titular_cuenta: utils.checkString(pago['TitularCuenta']),
                    fecha_vto_cheque: utils.getFecha(pago['FECHA_VTO']),
                    compensado: pago['Compensado']
                });
            } else {
                return Promise.resolve();
            }
        });
}

module.exports.migrar = function () {
    console.log('Migrando Comprobantes de Pago...');
    let q_objetos = `select RM.NumRecibo, RM.Item, RM.FechaPago_DATE,
    RM.Importe, RM.NroCheque, RM.CodBanco, RM.TitularCuenta,
    RM.Compensado, RM.FormaPago,
    FECHA_VTO= case when (FechaVto = '' OR FechaVto is Null) then null
    else  DATEADD(DAY, CONVERT(integer, fechaVto),'1800-12-28') end
    from RECMAT2 RM
    WHERE RM.NumRecibo BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(NumRecibo) as min, MAX(NumRecibo) as max from RECMAT2';

    return utils.migrar(q_objetos, q_limites, 100, addPagos);
}
