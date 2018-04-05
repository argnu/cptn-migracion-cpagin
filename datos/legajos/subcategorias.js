const connector = require(`../../../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`../../../../model`);
const utils = require(`../../utils`);

const addSubcategoria = (subcategoria)  => {
    let table = model.tareas.Subcategoria.table;
    let query = table.insert(
                  table.id.value(subcategoria['CODIGO']),
                  table.descripcion.value(utils.checkString(subcategoria['DESCRIPCION'])),
                  table.categoria.value(subcategoria['CODTAREAN1'])
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando subcategorias de tareas...');
    let q_objetos = 'select * from Tareas_N2 WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from Tareas_N2';

    return utils.migrar(q_objetos, q_limites, 100, addSubcategoria);
}
