var database = require('./database');

function getMember(context) {
    var member = {
        id: +context.id,
        name: context.name,
        gender: +context.gender,
        birthday: context.birthday
    };

    return member;
}

exports.list = function (req, res) {
    var page = database.getPage('members', req.body.page, req.body.pageSize);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(page));
};

exports.save = function (req, res) {
    var id = database.members().count() + 1;
    var member = getMember(req.body);
    member.balance = 0;
    member.id = id;
    database.members.insert(member);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
};

exports.update = function (req, res) {
    var member = getMember(req.body);
    database.members.merge(member, 'id');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
};

exports.find = function (req, res) {
    var member = database.members({ id: +req.query.id }).get()[0];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(member));
};

exports.remove = function (req, res) {
    var member = database.members({ id: +req.body.id }).remove();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
};