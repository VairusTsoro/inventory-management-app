'use strict';

module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define(`Items`, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    custom_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    inventory_id: {
      type: DataTypes.UUID,
      references: {
        model: "Inventories",
        key: "id"
      }
    },
    custom_fields: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  });
  return Item;
};