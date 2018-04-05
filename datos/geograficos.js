const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const utils = require('../utils');

const addPais = (pais) => {
    let table = model.Pais.table;
    let query = table.insert(
                  table.id.value(pais['CODIGO']),
                  table.nombre.value(utils.checkString(pais['DESCRIPCION']))
                ).toQuery();

    return connector.execQuery(query);
}

function migrarPaises() {
    console.log('Migrando paises...');
    let q_objetos = 'select * from T_PAIS WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_PAIS';

    return utils.migrar(q_objetos, q_limites, 100, addPais);
}


const addProvincia = (provincia) => {
    let table = model.Provincia.table;
    let query = table.insert(
                  table.id.value(provincia['CODPROVINCIA']),
                  table.nombre.value(utils.checkString(provincia['DESCRIPCION'])),
                  table.pais.value(provincia['CODPAIS'])
                ).toQuery();

    return connector.execQuery(query);
}

function migrarProvincias() {
    console.log('Migrando provincias...');
    let q_objetos = 'select * from T_PCIAS WHERE CODPROVINCIA BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODPROVINCIA) as min, MAX(CODPROVINCIA) as max from T_PCIAS';

    return utils.migrar(q_objetos, q_limites, 100, addProvincia);
}


const addDepartamento = (departamento) => {
    let table = model.Departamento.table;
    let query = table.insert(
                  table.id.value(departamento['CODDEPARTAMENTO']),
                  table.nombre.value(utils.checkString(departamento['DESCRIPCION'])),
                  table.provincia.value(departamento['CODPROVINCIA'])
                ).toQuery();

    return connector.execQuery(query);
}

function migrarDepartamentos() {
    console.log('Migrando departamentos...');
    let q_objetos = 'select * from T_DEPTOS WHERE CODDEPARTAMENTO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODDEPARTAMENTO) as min, MAX(CODDEPARTAMENTO) as max from T_DEPTOS';

    return utils.migrar(q_objetos, q_limites, 100, addDepartamento);
}

const addLocalidad = (localidad) => {
    let table = model.Localidad.table;
    let query = table.insert(
                  table.id.value(localidad['CODIGO']),
                  table.nombre.value(utils.checkString(localidad['DESCRIPCION'])),
                  table.departamento.value(localidad['CODDEPARTAMENTO'])
                ).toQuery();

    return connector.execQuery(query);
}

function migrarLocalidad() {
    console.log('Migrando localidades...');
    let q_objetos = 'select * from T_LOCALIDAD WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_LOCALIDAD';

    return utils.migrar(q_objetos, q_limites, 100, addLocalidad);
}


module.exports.migrar = function () {
    console.log('Migrando Datos Geográficos...');
    return migrarPaises()
        .then(r => migrarProvincias())
        .then(r => migrarDepartamentos())
        .then(r => migrarLocalidad())
}
