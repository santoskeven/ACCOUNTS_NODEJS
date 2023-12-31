const inquirer = require('inquirer')
const chalk = require('chalk')

const fs = require('fs')
const { parse } = require('path')

Operacao()

function Operacao(){

    inquirer.prompt([
        {
            type: 'list',
            name: 'acao',
            message: 'O que você deseja fazer',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Transferir',
                'Sacar',
                'Sair'
            ]
        }
    ]).then((resposta) => {

        const acao = resposta['acao']

        switch(acao){
            case 'Criar conta':
                CriarConta()
                break;

            case 'Depositar':
                Depositar()
                break;

            case 'Transferir':
                Transferir()
                break;

            case 'Consultar saldo':
                ConsultarSaldo()
                break;

            case 'Sacar':
                Sacar()
                break;

            case 'Sair':
                Sair()
                break;
        }

    }).catch(err => console.log(err))

}

// FUNÇÃO PARA SAIR 

function Sair(){

    inquirer.prompt([
        {   
            type: 'list',
            name: 'acao',
            message: 'Deseja limpar o registro de atividade?',
            choices: [
                'Sim',
                'Não'
            ]
        }
    ]).then((resposta) => {

        const acao = resposta['acao']

        if(acao === 'Sim'){
            console.clear()
            process.exit()
        }else{
            process.exit()
        }

    }).catch(err => console.log(err))

}

// FUNÇÃO PARA CRIAR A CONTA

function CriarConta(){

    inquirer.prompt([
        {
            name: 'NomeConta',
            message: 'Digite um nome para a sua conta'
        }
    ]).then((resposta) => {

        const conta = resposta['NomeConta']

        if(!fs.existsSync('contas')){
            fs.mkdirSync('contas')
        }

        if(!fs.existsSync(`contas/${conta}.json`)){
            fs.writeFileSync(`contas/${conta}.json`,
            `{"balance": 0}`,
            function(err){console.log(err)}),
            console.log(chalk.bgGreen('Conta Criada com sucesso'));

            Operacao()
        }else{
            console.log(chalk.bgRed.white('Essa conta já existe, tente outro nome!'))
            return CriarConta()
        }

    }).catch(err => console.log(err))

}

// FUNÇÃO PARA DEPOSITAR NA CONTA

function Depositar(){

    inquirer.prompt([
        {
            name: 'conta',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((resposta) => {

        const conta = resposta['conta']

        if(!VerificarConta(conta)){
            return Depositar()
        }

        inquirer.prompt([
            {
                name: 'valor',
                message: 'Quanto deseja depositar?'
            }
        ]).then((resposta) => {

            const valor = resposta['valor']

            AddValor(conta, valor)  

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))

}

function AddValor(NomeConta, valor){

    const contaData = PegarConta(NomeConta)

    if(!valor){
        console.log(`nenhum valor adicionado, tente novamente!!`);
        return Depositar();
    }

    contaData.balance = parseFloat(valor) + parseFloat(contaData.balance);

    EscreverBanco(NomeConta, contaData)
    
    console.log(`Foi depositado ${valor} na sua conta`)

    Operacao()
}

function EscreverBanco(NomeConta, contaData){
    fs.writeFileSync(
        `contas/${NomeConta}.json`,
        JSON.stringify(contaData),
        function(err){
            console.log(err)
        })
}

function VerificarConta(NomeConta){

    if(!fs.existsSync(`contas/${NomeConta}.json`)){
        console.log(chalk.bgRed.white('ops, não encontramos sua conta, tente novamente'));
        return false;
    }

    return true;
}

function PegarConta(NomeConta){

    const contaJSON = fs.readFileSync(`contas/${NomeConta}.json`, {
        encoding: 'utf8',
        flag: 'r'
    });

    return JSON.parse(contaJSON);

}

// FUNÇÃO PARA TRANSFERIR DINHEIRO EM CONTA

function Transferir(){

    inquirer.prompt([

        {
            name: 'conta',
            message: 'Qual o nome da sua conta?'
        }

    ]).then((resposta) => {

        const conta = resposta['conta']

        if(!VerificarConta(conta)){
            return Transferir()
        }

        inquirer.prompt([
            {
                name: 'valor',
                message: 'quanto deseja transferir?'
            }
        ]).then((resposta) => {

           const valor = resposta['valor']

           if(!valor){
            console.log(`nenhum valor adicionado, tente novamente!!`);
            return Transferir();
            }

           inquirer.prompt([
            {
                name: 'conta',
                message: 'Para quem deseja transferir?'
            }
           ]).then((resposta) => {

                const Tconta = resposta['conta'];

                if(!VerificarConta(Tconta)){
                    return Transferir()
                }

                TransferirConta(conta, valor, Tconta)

           }).catch(err =>  console.log(err))

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))

}

function TransferirConta(NomeConta, valor, ResConta){

    const contaData = PegarConta(NomeConta)

    const contaDataAdd = PegarConta(ResConta)

    if(contaData.balance < valor){
        console.log(chalk.bgRed.white('você não possui esse valor em sua conta'))
        return Transferir()
    }

    contaData.balance = parseFloat(contaData.balance) - parseFloat(valor);

    EscreverBanco(NomeConta, contaData)

    contaDataAdd.balance = parseFloat(contaDataAdd.balance) + parseFloat(valor)

    EscreverBanco(ResConta, contaDataAdd)

    console.log(`Você transferiru ${valor} para ${ResConta}`)

    Operacao()

}

// FUNÇÃO PARA CUNSULTAR SALDO DA CONTA

function ConsultarSaldo(){

    inquirer.prompt([
        {
            name: 'conta',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((resposta) => {

        const conta = resposta['conta'];

        if(!VerificarConta(conta)){
            return ConsultarSaldo();
        }

        const valor = PegarConta(conta);
        const ValorRes = valor.balance;

        console.log(chalk.bgGreen.white(`Seu saldo é de ${ValorRes}`));

        Operacao()

    }).catch(err => console.log(err));

}

// FUNÇÃO PARA SACAR VALOR 

function Sacar(){

    inquirer.prompt([
        {
            name: 'conta',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((resposta) => {

        const conta = resposta['conta']

        if(!VerificarConta(conta)){
           return Sacar()
        }

        inquirer.prompt([
            {
                name: 'valor',
                message: 'Quanto deseja sacar?'
            }
        ]).then((resposta) => {

            const valor = resposta['valor']

            SubValor(conta, valor)

        }).catch(err => console.log(err))


    }).catch(err => console.log(err))

}

function SubValor(NomeConta, valor){

    const contaData = PegarConta(NomeConta)

    if(!valor){
        console.log(`algo de errado, tente novamente`);
        return Sacar();
    }

    if(contaData.balance < valor){
        console.log(chalk.bgRed.white('você não possui esse valor em sua conta'))
        return Sacar()
    }

    contaData.balance = parseFloat(contaData.balance) - parseFloat(valor);

    EscreverBanco(NomeConta, contaData)

    console.log(`Você sacou ${valor} da sua conta`)

    Operacao();

}