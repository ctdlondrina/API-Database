const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "10.0.2.9",
    port: "3306",
    user: "ura",
    password: "ask123",
    database: "chamados"
});

let dia = new Date();

let data = [];
//data.push(180);
//data.push(dia.toLocaleString());
data.push('ABERTO');
data.push('43996611437');
data.push(6747);
data.push('JULIO CESAR COSTA');
data.push(3442);
data.push('julio.costa@ctd.net.br');
data.push('COORD. TEC. DA INFORMAÇÃO');
data.push('1');
data.push('Gabi e gente boa');

let midias = [];
midias.push('4396611437-20210117-21.jpeg');
midias.push('4396611437-20210117-475.jpeg');

//console.log(data);
//console.log(midias);


function teste(dados, arquivos) {
    console.log('Array Midias');
    arquivos.forEach((item, posicao) => {
        console.log(`item: ${item} posicao: ${posicao}`);
    })
    console.log('Array dados:');
    dados.forEach((item, posicao) => {
        console.log(`item: ${item} posicao: ${posicao}`);
    })
}
teste(data, midias)

function inserir(dado) {
    connection.query('INSERT INTO chamado(numero, data_abertura,' +
        ' status, num_whatsapp, re, nome, ramal, email, setor,' +
        ' opcao_menu, descricao) select max(numero) + 1 as numero, now(), ? FROM chamado', [dado], function (err, result) {
            if (err) { console.log(err) }
            if (result) {
                console.log(result.insertId);
            }
        });
}

async function insertBD2(data, midias) {
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
                        connection.end();
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
insertBD2(data, midias).then((id) => {
    console.log(`aqui é o array data: ${data}`)
    console.log(`e aqui é o array midia: ${midias}`)
    console.log(`mensagem do retorno da promisse ${id}`);
}).catch((error) => { throw error });
