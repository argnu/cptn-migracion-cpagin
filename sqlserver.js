const config = require('./config.private');
const sql = require('mssql');

module.exports.query = function (consulta, offset, limit) {
    return sql.connect(config.dbMssql)
           .then(r => {
             let msql_req = new sql.Request();
             if (offset != undefined) msql_req.input('offset', offset);
             if (limit != undefined) msql_req.input('limit', limit)
             return msql_req.query(consulta)
                 .then(listaRow => {
                     sql.close();
                     return listaRow.recordset;
                 })
                 .catch(error => {
                     sql.close();
                     console.log('Error en sql server', error);
                     throw Error(error);
                 });
           });
};
