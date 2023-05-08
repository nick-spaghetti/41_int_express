/** User class for message.ly */

const db = require('../db');
const bcrypt = require('bcrypt');
const expressError = require('../express-error');
const {
	BCRYPT_WORK_FACTOR
} = require('../config');


/** User of the site. */

class User {

	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({
		username,
		password,
		first_name,
		last_name,
		phone
	}) {
		let hashed = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const result = await db.query(`
		insert into users 
		(username, password, first_name, last_name, phone, join_at, last_login_at)
		values ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
		returning username, password, first_name, last_name, phone`,
			[username, hashed, first_name, last_name, phone]);
		return result.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const res = await db.query(
			`select password
			from users
			where username = $1`, [username]);
		let user = res.rows[0];
		return user && await bcrypt.compare(password, user.password);
	};

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		const res = await db.query(`
		update users
		set last_login_at = current_timestamp
		where username = $1
		returning username`, [username]);
		if (!res.rows[0]) {
			throw new expressError(`no such user: ${username}`, 404);
		};
	};

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const res = await db.query(`
		select username, first_name, last_name, phone
		from users
		order by username`);
		return res.rows[0];
	};

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {
		const res = await db.query(`
		select username, first_name, last_name, phone, join_at, last_login_at
		from users
		where username = $1`, [username]);
		if (!res.rows[0]) {
			throw new expressError(`no such user: ${username}`, 404);
		};
		return res.rows[0];
	};

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		const res = await db.query(`
		select m.id, m.to_username, u.first_name, u.last_name, u.phone m.body, m.sent_at, m.read_at
		from messages as m
		join users as u on m.to_username = u.username
		where from_username = $1`, [username]);
		return res.rows.map(m => ({
			id: m.id,
			to_user: {
				username: m.to_username,
				first_name: m.first_name,
				last_name: m.last_name,
				phone: m.phone
			},
			body: m.body,
			sent_at: m.sent_at,
			read_at: m.read_at
		}));
	};

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		const res = await db.query(`
		select m.id, m.from_username, u.first_name, u.last_name, u.phone m.body, m.sent_at, m.read_at
		from messages as m
		join users as u on m.to_username = u.username
		where from_username = $1`, [username]);
		return res.rows.map(m => ({
			id: m.id,
			from_user: {
				username: m.to_username,
				first_name: m.first_name,
				last_name: m.last_name,
				phone: m.phone
			},
			body: m.body,
			sent_at: m.sent_at,
			read_at: m.read_at
		}));
	};
}

module.exports = User;