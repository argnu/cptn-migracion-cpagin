const bancos = require('./bancos');
module.exports.bancos = bancos;

const estadoBoleta = require('./estadoBoleta');
module.exports.estadoBoleta = estadoBoleta;

const formaspago = require('./formaspago');
module.exports.formaspago = formaspago;

const monedas = require('./monedas');
module.exports.monedas = monedas;

const pagos = require('./pagos');
module.exports.pagos = pagos;

const tipoComprobante = require('./tipoComprobante');
module.exports.tipoComprobante = tipoComprobante;

const boleta = require('./boleta');
module.exports.boleta = boleta;

const boletaItem = require('./boletaItem');
module.exports.boletaItem = boletaItem;

const comprobante = require('./comprobante');
module.exports.comprobante = comprobante;

const comprobanteItem = require('./comprobanteItem');
module.exports.comprobanteItem = comprobanteItem;

const comprobantePago = require('./comprobantePago');
module.exports.comprobantePago = comprobantePago;

module.exports.migrar = function() {
  return bancos.migrar()
  .then(r => pagos.migrar())
  .then(r => monedas.migrar())
  .then(r => formaspago.migrar())
  .then(r => estadoBoleta.migrar())
  .then(r => tipoComprobante.migrar())
  .then(r => boleta.migrar())
  .then(r => boletaItem.migrar())
  .then(r => comprobante.migrar())
  .then(r => comprobanteItem.migrar())
  .then(r => comprobantePago.migrar());
}
