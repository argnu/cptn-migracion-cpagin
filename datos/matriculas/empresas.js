const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function createDomicilioReal (matricula) {
    if (matricula['DOMICREALCALLE'] && matricula['DOMICREALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = utils.checkString(matricula['DOMICREALCALLE']);
        nuevoDomicilio['localidad'] = matricula['DOMICREALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createDomicilioLegal (matricula) {
    if (matricula['DOMICLEGALCALLE'] && matricula['DOMICLEGALLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = utils.checkString(matricula['DOMICLEGALCALLE']);
        nuevoDomicilio['localidad'] = matricula['DOMICLEGALLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createDomicilioEspecial (matricula) {
    if (matricula['DOMICESPCALLE'] && matricula['DOMICESPLOCALIDAD'] ){
        let nuevoDomicilio = {};
        nuevoDomicilio['calle'] = utils.checkString(matricula['DOMICESPCALLE']);
        nuevoDomicilio['localidad'] = matricula['DOMICESPLOCALIDAD'];
        return nuevoDomicilio;
    }
    else return null;
}

function createEmpresa(matricula) {
    let nuevaEmpresa = {};
    nuevaEmpresa['nombre'] = utils.checkString(matricula['NOMBRE']);
    // nuevaEmpresa['cuit'] = matricula['CUIT'];
    nuevaEmpresa['fechaInicio'] = utils.getFecha(matricula['FECHAINC_DATE']);
    nuevaEmpresa['tipoEmpresa'] = matricula['TIPOEMPRESA'];
    nuevaEmpresa['tipoSociedad'] = matricula['TIPOSOCIEDAD'] ? matricula['TIPOSOCIEDAD'] : null;
    nuevaEmpresa['fechaConstitucion'] = utils.getFecha(matricula['FECHACONSTITUCION_date']);

    nuevaEmpresa.contactos = [];
    ['TELFIJO', 'TELCEL', 'EMAIL', 'PAGWEB'].forEach((tipo, i) => {
        if (matricula[tipo] && matricula[tipo].length) {
            nuevaEmpresa.contactos.push({
                tipo: i + 1, valor: utils.checkString(matricula[tipo])
            });
        }
    });

    //Datos para crear la entidad
    nuevaEmpresa['tipo'] = 'empresa';
    nuevaEmpresa['cuit'] = utils.checkString(matricula['CUIT']);

    let condafip = matricula['SITAFIP'];
    if (condafip != null) {
        if (condafip == 9) condafip = null;
        else condafip++
    }

    nuevaEmpresa['condafip'] = condafip;

    
    nuevaEmpresa['domicilios'] = [];
    let dom = createDomicilioReal(matricula);
    if (dom) {
        nuevaEmpresa['domicilios'].push({
            tipo: 'real',
            domicilio: dom
        })
    };
    dom = createDomicilioLegal(matricula);
    if (dom) {
        nuevaEmpresa['domicilios'].push({
            tipo: 'legal',
            domicilio: dom
        })
    };
    dom = createDomicilioEspecial(matricula);
    if (dom) {
        nuevaEmpresa['domicilios'].push({
            tipo: 'especial',
            domicilio: dom
        })
    };

    return model.Empresa.add(nuevaEmpresa);
}

const addMatricula = (matricula) => {
  return createEmpresa(matricula)
         .then(empresa => {
            let nuevaMatricula = {};
            nuevaMatricula.entidad = empresa.id;
            nuevaMatricula.solicitud = null;
            nuevaMatricula.fechaResolucion = utils.getFecha(matricula['FECHARESOLUCION_DATE']);
            nuevaMatricula.numeroMatricula = utils.checkString(matricula['NROMATRICULA']);
            nuevaMatricula.numeroActa = utils.checkString(matricula['NUMACTA']);
            nuevaMatricula.observaciones = utils.checkString(matricula['OBSERVACIONES']);
           //nuevaMatricula.notasPrivadas = utils.checkString(matricula['NOTASPRIVADAS']);
           nuevaMatricula.estado = matricula['ESTADO'];
           nuevaMatricula.idMigracion = matricula['ID'];
           return model.Matricula.addMatriculaMigracion(nuevaMatricula);
         })
}


module.exports.migrar = function() {
    console.log('Migrando empresas...');
    let q_objetos = 'select * ' +
    'from EMPRESAS WHERE ID BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from EMPRESAS';

    return utils.migrar(q_objetos, q_limites, 100, addMatricula);
}
