const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const funcao = require('./funcoes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

//definindo as rotas
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

router.get('/getUsuario/:id', (req, res) => {
    funcao.getUsuario(`SELECT * FROM agenda WHERE re = ${req.params.id}`, function (error, result) {
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
    funcao.getUsuario(`SELECT * FROM agenda WHERE UPPER(nome) LIKE UPPER('%${req.params.id}%')`, function (error, result) {
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
    funcao.execSQLQuery(`SELECT *,date_format(data_abertura,'%d/%m/%Y') as data FROM chamado WHERE numero=${req.params.id}`, function (error, result) {
        if (error) {
            res.json(error);
        }
        if (result) {
            res.json(result);
        }
    });
});

router.post('/insertComMidias', (req, res) => {
    const data = req.query.data.split(',');
    const midias = req.query.midias.split(',');

    console.log(data)
    console.log(midias)

    funcao.insertBD(data, midias).then((id) => {
        console.log(`aqui é o array data: ${data}`)
        console.log(`e aqui é o array midias: ${midias}`)
        console.log(`mensagem do retorno da promisse ${id}`);
        res.json(id);
    }).catch((error) => { throw error });


});

router.post('/inserir/:valor', (req, res) => {
    var val = [req.params.valor]
    console.log(val)
    inserir(val)
})


//inicia o servidor
app.listen(3000, function () {
    console.log("Servidor Iniciado e escutando na porta 3000");
});