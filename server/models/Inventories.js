'use strict';
module.exports = (sequelize, DataTypes) => {
  const Inventories = sequelize.define('Inventories', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [1, 500]
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
        is: /^[a-zA-Z0-9, ]*$/
      }
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[a-zA-Z0-9, ]*$/
      }
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    has_access: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: []
    },
    custom_fields: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    custom_fields_is_public: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    custom_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  });
  return Inventories;
};