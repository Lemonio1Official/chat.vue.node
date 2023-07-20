create TABLE users(
    id serial primary key,
    uid varchar(24) not null unique,
    nickname varchar(24) not null,
    password varchar(100) not null,
    visit bigint default 0,
    chats json default '[]'
)

create TABLE chats(
    id serial primary key,
    members json not null,
    lastmessage json not null
)

create TABLE messages(
    message varchar not null,
    owner_id int not null,
    chat_id int not null,
    status varchar not null,
    time bigint not null,
    deleted json default '[]'
)
