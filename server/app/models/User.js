"use strict";

const { Model } = require('objection');
const knex = require('../../database/knex')

Model.knex(knex)

class User extends Model {
  static get tableName() {
    return 'users';
  }


  static create = props => {
    return knex(this.tableName).insert(props)
  }


  static paginate = request => {
    let query = knex(this.tableName)
    const {
      status ='',
      search = '',
      role = ''
    } = request.query

    if (search) {
        query = query.where((query) => {
          query
            .orWhere('users.name', 'LIKE', `%${search}%`)
            .orWhere('users.id', 'LIKE', `%${search}%`)
            .orWhere('users.email', 'LIKE', `%${search}%`)
        })
    }
    if(status) {
      query = query.where('users.is_active', '=', status === 'true' ? 1 : 0)
    }

    if(role) {
      query = query.where('users.role_id', '=', Number(role))
    }

    return query
      .join('roles', 'users.role_id', '=', 'roles.id')
      .select('users.id', 'users.name', 'users.created_at', 'users.email', 'users.phone', 'users.is_active', 'users.role_id', 'roles.name as role_name') // Select role name from roles table
      .orderBy('users.id', 'desc')
      .paginate({
        perPage: Number(request.query.size) || 10,
        currentPage: Number(request.query.page) || 1,
        isLengthAware:true
      })

  }

  static findById = id => {
    return knex(this.tableName).where({ id: id }).first().then((row) => row)
  }

  static findOne = query => {
    return knex(this.tableName).where(query).first().then((row) => row)
  }

  static findByIdAndRemove = id => {
    return knex(this.tableName).del().where({ id: id })
  }

  static updatedRecord = (id, record) => {
    return knex(this.tableName).where({ id: id }).update(record);
  }

}

module.exports = User;