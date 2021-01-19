const mysql = require('mysql');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

try {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_12_2' });
} catch (err) {
    console.error('Oracle Instant Client não encontrado!');
    console.error(err);
    process.exit(1);
}

function execSQLQuery(sqlQry, callback) {
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
    }
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

async function insertBD(data, midias) {
    const promise = new Promise((resolve, reject) => {
        connection.connect();
        connection.beginTransaction(function (err) {
            var lastID;
            if (err) {
                throw err;
            }
            else {
                connection.query('INSERT INTO chamado(numero, data_abertura,' +
                    ' status, num_whatsapp, re, nome, ramal, email, setor,' +
                    ' opcao_menu, descricao) select max(numero) + 1 as numero, now(), ? FROM chamado', [data], function (err, result) {
                        if (err) {
                            connection.rollback(function () {
                                throw err;
                            });
                        }
                        lastID = result.insertId;
                        midias.forEach(element => {
                            connection.query(`INSERT INTO midias(chamadoID, nome_arquivo) VALUES (${lastID}, ?)`, element, function (err, result) {
                                if (err) {
                                    connection.rollback(function () {
                                        throw err;
                                    });
                                }
                            });
                        });
                    });
                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            throw err;
                        });
                        reject(err);
                    }
                    else {
                        connection.query('SELECT * FROM chamado WHERE id = ?', lastID, function (err, result) {
                            resolve(result[0].numero);
                            connection.end();
                        })
                    }
                    console.log('Gravado com sucesso!');
                });
            }
        });
    });
    return promise;
}

exports.execSQLQuery = execSQLQuery;
exports.getUsuario = getUsuario;
exports.insertBD = insertBD;