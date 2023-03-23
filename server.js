const express = require('express');
const app = express();
const port = 8000;
const alert = require('alert');
var fs = require('fs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Khai báo sử dụng Handlebars làm view engine
const expressHbs = require('express-handlebars');
const { link } = require('fs');

app.use(express.static('public'));

app.engine('.hbs', expressHbs.engine({
    extname: "hbs",
    defaultLayout: 'home'
}))
app.set('view engine', '.hbs');

const accounts = [
    { username: 'user1@gmail.com', password: 'pass1' },
    { username: 'user2@gmail.com', password: 'pass2' },
    { username: 'user3@gmail.com', password: 'pass3' },
];

// Khai báo route cho trang đăng nhập
app.get('/', function (req, res) {
    res.render('home', {
        layout: 'main',
        style: 'style.css'
    })
});
app.get('/userProfile', function (req, res) {
    res.render('home', {
        layout: 'userProfile',
    })
});
app.get('/tableList', function (req, res) {
    res.render('home', {
        layout: 'tableList',
    })
});
app.get('/deletePr', (req, res) => {
    let prNum = req.query.prNum
    fs.readFile('productsData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('productsData.json')
        let myData = JSON.parse(da)
        let i = 0
        while (true) {
            if (myData[i].id == prNum) {
                myData.splice(i, 1)
                break
            }
            i++
        }
        let newData = JSON.stringify(myData)
        fs.writeFile('productsData.json', newData, function (err) {
            if (err) throw err;
            res.redirect('/listPrs')
        })
    })
})
app.get('/filter', (req, res) => {
    let sName = req.query.username
    let sEmail = req.query.email
    fs.readFile('usersData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let arr = []
        for (let i = 0; i < myData.length; i++) {
            if (myData[i].name.search(sName) !== -1 && myData[i].email.search(sEmail) !== -1) {
                arr.push(myData[i])
            }
            console.log(arr);
        }
        res.render('home', { layout: 'userProfile', userData: arr })
        // fs.writeFile('usersData.json', newData, function (err) {
        //     if (err) throw err;
        //     res.redirect('/listUsers')
        // })
    })
})

// Xử lý đăng nhập
app.post('/quanly', (req, res) => {
    const usernameLogin = req.body.email;
    const passwordLogin = req.body.pwd;
    for (let i = 0; i < accounts.length; i++) {
        if (usernameLogin === accounts[i].username && passwordLogin === accounts[i].password) {
            //return res.send('Đăng nhập thành công');
            return res.render('home', { layout: 'quanly' },
            );
        }
    }
    alert('Sai mật khẩu hoặc tài khoản!')
});
app.post('/main', (req, res) => {
    let dataUser = req.body
    fs.readFile('usersData.json', function (err, data) {

        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        // let arr = dataUser.imgRes.split('.')
        // let newFilename = arr[0] + '-' + Date.now() + '.' + arr[1]
        let newObj = { "id": obj[obj.length - 1].id + 1, "email": dataUser.emailRes, "name": dataUser.nameRes, "pass": dataUser.passRes}
        myData.push(newObj)
        let newData = JSON.stringify(myData)
        fs.writeFile('usersData.json', newData, function (err) {
            alert('Đăng kí thành công')
            res.render('home', {
                layout: 'main',
                style: 'style.css',
            })
        })
    })
});
app.get('/quanly', function (req, res) {
    res.render('home', {
        layout: 'quanly'
    })
});

app.get('/listPrs', (req, res) => {
    let namePr = req.query.namePr
    let pricePr = req.query.pricePr
    let imgPr = req.query.imgPr
    let colorPr = req.query.clPr
    let typePr = req.query.tPr
    let idUser = req.query.idKHPr
    let prNum = req.query.prNum
    let newUser
    fs.readFile('productsData.json', function (err, data) {
        if (!prNum) {
            let obj = JSON.parse(data)
            res.render('home', { layout: 'tableList', prData: obj })
        } else {
            let da = fs.readFileSync('productsData.json')
            let myData = JSON.parse(da)
            for (let i = 0; i < myData.length; i++) {
                if (myData[i].id == prNum) {
                    fs.readFile('usersData.json', function (err, data) {
                        let daU = fs.readFileSync('usersData.json')
                        let myDataU = JSON.parse(daU)
                        for (let j = 0; j < myDataU.length; j++) {
                            if (myDataU[j].id == idUser) {
                                myData[i].namePr = namePr
                                myData[i].price = parseInt(pricePr)
                                myData[i].imgPr = imgPr
                                myData[i].color = colorPr
                                myData[i].type = typePr
                                myData[i].idUser = parseInt(idUser)
                                myData[i].nameUser = myDataU[j].name
                                console.log("ok vao day" + myData[i].price);
                                let newData = JSON.stringify(myData)
                                fs.writeFile('productsData.json', newData, function (err) {
                                    if (err) throw err;
                                    res.redirect('/listPrs')
                                })
                                break
                            }
                            res.redirect('/listPrs')
                            break

                        }
                        console.log(namePr + " va " + pricePr);
                    })
                }
            }
        }

    })

})
app.get('/updatePr', (req, res) => {
    let prNum = req.query.prNum
    fs.readFile('productsData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('productsData.json')
        let myData = JSON.parse(da)
        let i = 0
        let upObj;
        while (true) {
            if (myData[i].id == prNum) {
                upObj = myData[i]
                break
            }
            i++
        }
        fs.readFile('usersData.json', function (err, data) {
            let da = fs.readFileSync('usersData.json')
            let myDataUsers = JSON.parse(da)
            res.render('home', { layout: 'updateSanPham', user: upObj, index: prNum, listUsers: myDataUsers })
        })
    })
})
app.get('/delete', (req, res) => {
    let userNum = req.query.userNum

    fs.readFile('usersData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let i = 0
        while (true) {
            if (myData[i].id == userNum) {
                myData.splice(i, 1)
                break
            }
            i++
        }
        let newData = JSON.stringify(myData)
        fs.writeFile('usersData.json', newData, function (err) {
            if (err) throw err;
            res.redirect('/listUsers')
        })
    })
})
app.get('/addNewPr', (req, res) => {
    res.render('home', { layout: 'addSanPham' })
})

app.post('/addNewPr/done', (req, res) => {
    fs.readFile('productsData.json', function (err, data) {
        let newPr = req.body
        let obj = JSON.parse(data)
        let da = fs.readFileSync('productsData.json')
        let myData = JSON.parse(da)
        fs.readFile('usersData.json', function (err, data) {
            let daU = fs.readFileSync('usersData.json')
            let myDataU = JSON.parse(daU)
            for (let j = 0; j < myDataU.length; j++) {
                if (myDataU[j].id == newPr.idKHPr) {
                    let newObj = { "id": obj[obj.length - 1].id + 1, "namePr": newPr.namePr, "price": newPr.pricePr, "imgPr": newPr.imgPr, "color": newPr.clPr, "type": newPr.tPr, "idUser": parseInt(newPr.idKHPr), "nameUser": myDataU[j].name }
                    myData.push(newObj)
                    console.log(myData);
                    let newData = JSON.stringify(myData)
                    fs.writeFile('productsData.json', newData, function (err) {
                        if (err) throw err;
                        res.redirect('/listPrs')
                    })
                    break
                }
            }
            console.log(newPr);

        })
    })
})



// Khởi động server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});