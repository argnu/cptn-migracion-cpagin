const connector = require(`../../../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`../../../../model`);
const utils = require(`../../utils`);

const addItem = (item)  => {
    let table = model.tareas.Item.table;
    let id = `${item['CODIGO']}${item['NUMEROPREGUNTA']}`;
    let query = table.insert(
                  table.id.value(id),
                  table.descripcion.value(utils.checkString(item['DESCRIPCION']))
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando items de tareas...');
    let q_objetos = 'select * from PreguntasTareas WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from PreguntasTareas';

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}
