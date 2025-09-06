'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    authId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
  return User;
};
