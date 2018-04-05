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

function createProfesional(matricula) {
    let nuevoProfesional = {};
    let dni = matricula['NUMDOCU'];
    if (dni.length > 10) dni = matricula['CUIT'].substring(3, 11);
    nuevoProfesional['dni'] = utils.checkString(dni);
    nuevoProfesional['apellido'] = utils.checkString(matricula['APELLIDO']);
    nuevoProfesional['nombre'] = utils.checkString(matricula['NOMBRE']);
    nuevoProfesional['fechaNacimiento'] = utils.getFecha(matricula['FECNAC_DATE']);
    nuevoProfesional['estadoCivil'] = matricula['ESTADOCIVIL'] + 1;
    nuevoProfesional['observaciones'] = utils.checkString(matricula['OBSERVACIONES']);
    nuevoProfesional['lugarNacimiento'] = utils.checkString(matricula['lugarNacimiento']);

    nuevoProfesional.contactos = [];
    ['TELFIJO', 'TELCEL', 'EMAIL', 'PAGWEB'].forEach((tipo, i) => {
        if (matricula[tipo] && matricula[tipo].length) {
            nuevoProfesional.contactos.push({
                tipo: i + 1, valor: utils.checkString(matricula[tipo])
            });
        }
    });

    nuevoProfesional['relacionDependencia'] = matricula['RELACIONLABORAL'];
    nuevoProfesional['empresa'] = utils.checkString(matricula['EMPRESA']);
    nuevoProfesional['serviciosPrestados'] = utils.checkString(matricula['SERVICIOSPRESTADOS']);
    if (matricula['SERVICIOSPRESTADOS']) {
        nuevoProfesional['independiente'] = 1;
    } else {
        nuevoProfesional['independiente'] = 0;
    }
    nuevoProfesional['poseeCajaPrevisional'] = (matricula['CODESTADOCAJA'] == 2);
    nuevoProfesional['publicar'] = matricula['PUBLICARDATOS'];
    //Datos para crear la entidad
    nuevoProfesional['tipo'] = 'profesional';
    nuevoProfesional['cuit'] = utils.checkString(matricula['CUIT']);

    let condafip = matricula['SITAFIP'];
    if (condafip != null) {
        if (condafip == 9) condafip = null;
        else condafip++
    }

    nuevoProfesional['condafip'] = condafip;
    // Se crean los contactos del profesional


    nuevoProfesional['domicilios'] = [];
    let dom = createDomicilioReal(matricula);
    if (dom) {
        nuevoProfesional['domicilios'].push({
            tipo: 'real',
            domicilio: dom
        })
    };
    dom = createDomicilioLegal(matricula);
    if (dom) {
        nuevoProfesional['domicilios'].push({
            tipo: 'legal',
            domicilio: dom
        })
    };
    dom = createDomicilioEspecial(matricula);
    if (dom) {
        nuevoProfesional['domicilios'].push({
            tipo: 'especial',
            domicilio: dom
        })
    };

    return model.Profesional.add(nuevoProfesional);
}

const addMatricula = (matricula) => {
  return createProfesional(matricula)
         .then(profesional => {
            let nuevaMatricula = {};
            nuevaMatricula.entidad = profesional.id;
            nuevaMatricula.solicitud = null;
            nuevaMatricula.fechaResolucion = utils.getFecha(matricula['FECHARESOLUCION_DATE']);
            nuevaMatricula.numeroMatricula = utils.checkString(matricula['NROMATRICULA']);
            nuevaMatricula.numeroActa = utils.checkString(matricula['NUMACTA']);
            nuevaMatricula.fechaBaja = utils.getFecha(matricula['FECHABAJA_DATE']);
            nuevaMatricula.observaciones = utils.checkString(matricula['OBSERVACIONES']);
            nuevaMatricula.notasPrivadas = utils.checkString(matricula['NOTASPRIVADAS']);
            nuevaMatricula.asientoBajaF = utils.checkString(matricula['ASIENTOBAJAF']);
            nuevaMatricula.codBajaF = utils.checkString(matricula['CODBAJAF']);
            nuevaMatricula.estado = matricula['ESTADO'];
            nuevaMatricula.idMigracion = matricula['ID'];
            nuevaMatricula.legajo = matricula['LEGAJO'];
           return model.Matricula.addMatriculaMigracion(nuevaMatricula);
         })
}


module.exports.migrar = function() {
    console.log('Migrando matrículas...');
    let q_objetos = `select M.ID, M.SITAFIP, M.CUIT, 
        M.DOMICREALCALLE, M.DOMICREALCODPOSTAL, 
        M.DOMICREALDEPARTAMENTO, M.DOMICREALLOCALIDAD, 
        M.DOMICREALPROV, M.DOMICREALPAIS, 
        M.DOMICLEGALCALLE, M.DOMICLEGALCODPOSTAL, 
        M.DOMICLEGALDEPARTAMENTO, M.DOMICLEGALLOCALIDAD, 
        M.DOMICLEGALPROV, M.DOMICLEGALPAIS, 
        M.NOMBRE, M.APELLIDO, M.FECNAC_DATE ,M.NUMDOCU, 
        M.ESTADOCIVIL, l.DESCRIPCION as lugarNacimiento,
        M.OBSERVACIONES, M.RELACIONLABORAL, M.EMPRESA, M.SERVICIOSPRESTADOS, 
        M.TELFIJO, M.TELCEL, M.EMAIL, M.PAGWEB, 
        M.PUBLICARDATOS, M.CODESTADOCAJA, 
        M.LEGAJO, M.NROMATRICULA, M.FECHARESOLUCION_DATE, 
        M.NUMACTA, M.FECHABAJA_DATE, M.NOTASPRIVADAS,
        M.ASIENTOBAJAF, M.CODBAJAF, M.NOMBREARCHIVOFOTO, 
        M.NombreArchivoFirma, M.ESTADO 
    from MATRICULAS M left join T_LOCALIDAD l
    on m.LUGNACCIUDAD = l.CODIGO
    WHERE ID BETWEEN @offset AND @limit;`
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MATRICULAS';

    return utils.migrar(q_objetos, q_limites, 100, addMatricula);
}
