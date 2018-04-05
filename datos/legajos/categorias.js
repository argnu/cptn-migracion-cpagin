const connector = require(`../../../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`../../../../model`);
const utils = require(`../../utils`);

const addCategoria = (categoria)  => {
    let table = model.tareas.Categoria.table;
    let query = table.insert(
                  table.id.value(categoria['CODIGO']),
                  table.descripcion.value(utils.checkString(categoria['DESCRIPCION']))
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando categorias de tareas...');
    let q_objetos = 'select * from Tareas_N1 WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from Tareas_N1';

    return utils.migrar(q_objetos, q_limites, 100, addCategoria);
}
