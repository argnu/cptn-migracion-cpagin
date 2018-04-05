const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

function addBoletaItem(boletaItem) {
    return model.Boleta.getByNumero(boletaItem['NUMBOLETA'])
           .then(boleta => {
             let table = model.BoletaItem.table;
             let query = table.insert(
                           table.boleta.value(boleta.id),
                           table.item.value(boletaItem['ITEM']),
                           table.descripcion.value(utils.checkString(boletaItem['DESCRIPCION'])),
                           table.importe.value(boletaItem['MONTO'])
                         ).toQuery();

             return connector.execQuery(query);
           });
  }


module.exports.migrar = function() {
    console.log('Migrando items de boletas...');
    let q_objetos = `select i.NUMBOLETA, i.ITEM, i.DESCRIPCION, i.MONTO, i.CODTIPOASTO
      from BOL_ITEMS i inner join BOLETAS b on b.NUMBOLETA=i.NUMBOLETA
      inner join MATRICULAS m on m.ID=b.IDMATRICULADO
      WHERE i.NUMBOLETA BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(NUMBOLETA) as min, MAX(NUMBOLETA) as max from BOL_ITEMS';

    return utils.migrar(q_objetos, q_limites, 100, addBoletaItem);
}
