var Taffy = require('taffydb').taffy;

function random(start, end) {
    var value = Math.round(Math.random() * (end - start)) + start;
    return value;
}

var members = Taffy();
members.insert({ id: 1, name: '李享', gender: 0, birthday: '1983-05-28', balance: 233 });
members.insert({ id: 2, name: '石磊', gender: 0, birthday: '1984-07-22', balance: 1024 });
members.insert({ id: 3, name: '李义冬', gender: 1, birthday: '1987-08-13', balance: 198 });
members.insert({ id: 4, name: '刘恺华', gender: 1, birthday: '1986-08-25', balance: -1322 });
members.insert({ id: 5, name: '沈彬', gender: 1, birthday: '1988-03-14', balance: 4 });
members.insert({ id: 6, name: '张立理', gender: 1, birthday: '1986-10-05', balance: -130 });
members.insert({ id: 7, name: '孙金飞', gender: 1, birthday: '1980-03-11', balance: 250 });
members.insert({ id: 8, name: '叶梦秋', gender: 0, birthday: '1987-11-1', balance: 14 });

var affairs = Taffy();
for (var i = 0; i < 36; i++) {
    var member = members({ id: random(1, 8) }).get()[0];
    var item = {
        id: i + 1,
        time: '2013-' + random(1, 12) + '-' + random(1, 28),
        member: {
            id: member.id,
            name: member.name
        },
        type: random(0, 1),
        amount: random(0, 43),
        balance: random(-990, 988)
    };
    affairs.insert(item);
}

var activities = Taffy();

var database = module.exports = {
    members: members,
    affairs: affairs,

    getPage: function (table, page, pageSize) {
        page = page ? +page : 1;
        pageSize = pageSize ? +pageSize : 10;
        if (typeof table === 'string') {
            table = database[table];
        }
        table = table();

        return {
            totalCount: table.count(),
            page: page,
            pageSize: 10,
            results: table.start((page - 1) * pageSize).limit(pageSize).get()
        };
    }
}