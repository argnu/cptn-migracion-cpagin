const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const utils = require('../utils');

const addDelegacion = (delegacion)  => {
    let table = model.Delegacion.table;
    let query = table.insert(
                  table.id.value(delegacion['CODIGO']),
                  table.nombre.value(utils.checkString(delegacion['DESCRIPCION']))
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando delegaciones...');
    let q_objetos = 'select * from T_SUCURSAL WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_SUCURSAL';

    return utils.migrar(q_objetos, q_limites, 100, addDelegacion);
}
