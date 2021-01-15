const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const mysql = require('mysql');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

router.get('/getUsuario/:id', (req, res) => {
    getUsuario(`SELECT * FROM agenda WHERE re = ${req.params.id}`, function (error, result) {
        if (error) {
            console.log('Ocorreu o seguinte erro ao fazer a consulta ', error);
            res.json(error);
        }
        else {
            if (result === 0) {
                res.json([{ 0: 'RE *não cadastrado*\nPor favor verifique e tente novamente!' }]);
            }
            else {
                res.json(result);
            }
        }
    });
});

router.get('/getRamal/:id', (req, res) => {
    getUsuario(`SELECT * FROM agenda WHERE UPPER(nome) LIKE UPPER('%${req.params.id}%')`, function (error, result) {
        if (error) {
            console.log('Ocorreu o seguinte erro ao fazer a consulta ', error);
            res.json(error);
        }
        else {
            if (result === 0) {
                res.json([{ 0: 'RE *não cadastrado*\nPor favor verifique e tente novamente!' }]);
            }
            else {
                res.json(result);
            }
        }
    });
});

router.get('/getStatusChamado/:id', (req, res) => {
    execSQLQuery(`SELECT *,date_format(data_abertura,'%d/%m/%Y') as data FROM chamado WHERE numero=${req.params.id}`, function (error, result) {
        if (error) {
            res.json(error);
        }
        if (result) {
            res.json(result);
        }
    });
});

//inicia o servidor
app.listen(port);
console.log('API funcionando!');

function execSQLQuery(sqlQry, callback) {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });
    try {
        connection.connect();
        connection.query(sqlQry, function (error, results, fields) {
            if (results) {
                return callback(results);
            }
        });
    } catch (error) {
        return callback(error);
    } finally {
        connection.end();
        console.log('executou!');
    }
}

try {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_12_2' });
} catch (err) {
    console.error('Oracle Instant Client não encontrado!');
    console.error(err);
    process.exit(1);
}

async function getUsuario(sql, callback) {
    let connection, result;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECTSTRING
        });
        result = await connection.execute(sql);
        if (result.rows.length > 0) {
            return callback(null, result.rows);
        } else {
            return callback(null, 0);
        }
    } catch (err) {
        return callback(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
                return callback(err);
            }
        }
    }
}
