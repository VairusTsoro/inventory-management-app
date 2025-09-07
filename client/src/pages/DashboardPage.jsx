import { useEffect, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/DashboardPage.css';
import LightDarkSwitch from '../components/LightDarkSwitch';
import LanguageSelect from '../components/LanguageSelect';

function DashboardPage() {
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [itemsByInventoryId, setItemsByInventoryId] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState({ show: false, title: '', message: '', headerClass: '' });
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hasAccess, setHasAccess] = useState([]);
  const [newUserInput, setNewUserInput] = useState('');
  const [fieldNameList, setFieldNameList] = useState([]);
  const [fieldTypeList, setFieldTypeList] = useState([]);
  const [fieldStateList, setFieldStateList] = useState(Array(15).fill(false));
  const [customIdList, setCustomIdList] = useState([{ type: 'fixed', value: 'ABC' }, { type: '20-bit-random-number', value: 'D6' }, { type: 'sequence', value: 'D4' }, { type: 'date/time', value: 'yyyy-mm-dd' }]);
  // fixed, 20-bit random, 32-bit random, 6-digit random, 9-digit random, guid, sequence, date/time
  const customIdFormatting = [["input"], ["D6", "X5"], ["D10", "X8"], ["D6", "X6"], ["D9", "X9"], ["Default"], ["D4", "D"], ['yyyy-mm-dd-hh-mmm', 'hh-mmm', 'yyyy-mm-dd', 'yyyy', 'mm', 'dd', 'ddd', 'yyyy-mm', 'mm-dd', 'mm-ddd']];
  const customIdFormattingIndexes = {
    'fixed': 0,
    '20-bit-random-number': 1,
    '32-bit-random-number': 2,
    '6-digit-random-number': 3,
    '9-digit-random-number': 4,
    'guid': 5,
    'sequence': 6,
    'date/time': 7
  }
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [openedInventories, setOpenedInventories] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    fetchInventories();
    console.log(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    openedInventories.forEach(id => {
      if (!itemsByInventoryId[id]) {
        fetchItems(id);
      }
    });
  }, [openedInventories]);

  const checkAuthStatus = async () => {
    const res = await fetch('/api/auth-status', {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      setIsLoggedIn(data.loggedIn);
      if (data.loggedIn) setUser(data.user);
    }
  };

  const fetchInventories = async () => {
    try {
      const res = await fetch('/api/inventories');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setInventories(data);
    } catch (err) {
      showToast('Error', 'Failed to fetch inventories', 'bg-danger');
    }
  };

  const fetchItems = async (inventoryId) => {
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error('Network response was not ok');
      let data = await res.json();
      if (data && !Array.isArray(data)) {
        data = [data];
      }
      data = data.filter(item => item.inventory_id === inventoryId);
      if (data) {
        setItemsByInventoryId(prev => ({
          ...prev,
          [inventoryId]: [...(prev[inventoryId] || []), ...data]
        }));
      }
    } catch (err) {
      showToast('Error', 'Failed to fetch items', 'bg-danger');
    }
  };

  const addItem = async (inventoryId) => {
    const newItemFieldElements = Array.from(document.querySelectorAll(`.new-item-field`));
    if (newItemFieldElements.some(field => field.value.trim() === '')) {
      showToast('Error', 'Please fill in all fields', 'bg-warning');
      return;
    }
    const item = {
      custom_id: document.getElementById('new-item-custom-id').innerText,
      is_public: document.getElementById('new-item-is-public').checked,
      inventory_id: inventoryId,
      custom_fields: {
        ...newItemFieldElements.reduce((acc, field) => {
          acc[field.dataset.fieldType] = field.value;
          return acc;
        }, {})
      }
    };
    try {
      const res = await fetch("/api/items", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      let data = await res.json();
      if (data && !Array.isArray(data)) data = [data];
      data = data.filter(item => item.inventory_id === inventoryId);
      setItemsByInventoryId(prev => ({
        ...prev,
        [inventoryId]: [...(prev[inventoryId] || []), ...data]
      }));
    } catch (err) {
      showToast('Error', 'Failed to add item', 'bg-danger');
    }
    newItemFieldElements.forEach(field => field.value = '');
  };

  const createInventory = async (inventory) => {
    const res = await fetch('/api/inventories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inventory)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    try {
      const field_is_public_checkboxs = document.querySelectorAll('.field_is_public');
      const result = await createInventory({
        title, description, category, tags, image, is_public: isPublic, owner_id: user.user_id, has_access: [user.user_id],
        custom_fields: {
          ...fieldNameList.reduce((acc, name, index) => {
            acc[name] = fieldTypeList[index];
            return acc;
          }, {})
        },
        custom_fields_is_public: {
          ...fieldNameList.reduce((acc, name, index) => {
            acc[name] = field_is_public_checkboxs[index]?.checked ?? false;
            return acc;
          }, {})
        },
        custom_ids: {
          ...customIdList.reduce((acc, custom_id) => {
            acc[custom_id.type] = custom_id.value;
            return acc;
          }, {})
        }
      });
      showToast('Success', 'Inventory created!', 'bg-success');
      setTitle('');
      setDescription('');
      setCategory('');
      setTags('');
      setImage('');
      setIsPublic(false);
      setFieldNameList([]);
      setFieldTypeList([]);
      setHasAccess([]);
      setFieldStateList(Array(15).fill(false));
      setCustomIdList([{ type: 'fixed', value: 'ABC' }, { type: '20-bit-random-number', value: 'D6' }, { type: 'sequence', value: 'D4' }, { type: 'date/time', value: 'yyyy-mm-dd' }]);
      fetchInventories();
    } catch (err) {
      showToast('Error', 'Error creating inventory', 'bg-danger');
    }
  };


  const showToast = (title, message, headerClass = '', confirmCallback = null) => {
    setToast({ show: true, title, message, headerClass, confirmCallback });
    setTimeout(() => {
      if (!confirmCallback) setToast(t => ({ ...t, show: false }));
    }, 3000);
  };

  const handleFieldNameChange = (index, newValue) => {
    setFieldNameList(list =>
      list.map((item, i) =>
        i === index ? newValue : item
      )
    );
  };

  const handleAddField = () => {
    const activeFields = fieldStateList.filter(item => item === true).length;
    if (activeFields >= 15) {
      showToast('Limit reached', 'You can\'t add up to 15 fields', 'bg-warning');
      return;
    }
    setFieldStateList(prev => {
      const newList = [...prev];
      const index = newList.findIndex(item => item === false);
      if (index !== -1) newList[index] = true;
      return newList;
    });
  };

  const handleCustomIdChange = (index, field, newValue) => {
    const regex = /[^A-Za-z0-9]/g;
    if (customIdList[index].type === 'fixed') {
      if (!regex.test(newValue)) showToast('Warning', 'Invalid format. Can only use alphanumeric characters.', 'bg-warning');
      newValue = newValue.replace(regex, '').toUpperCase();
    }
    setCustomIdList(list =>
      list.map((item, i) =>
        i === index ? { ...item, [field]: newValue } : item
      )
    );
  };

  const handleRemoveSelectedFields = () => {
    const fieldSelectors = document.querySelectorAll('.field_selector');
    const selectedFields = Array.from(fieldSelectors).filter(input => input.checked).map(input => input.id);
    if (selectedFields.length === 0) {
      showToast('Warning', 'No fields selected', 'bg-warning');
      return;
    }
    setFieldNameList(fieldNameList.map((name, index) => !selectedFields.includes(`field_${index}_selector`) ? name : ''));
    setFieldTypeList(fieldTypeList.map((type, index) => !selectedFields.includes(`field_${index}_selector`) ? type : ''));
    setFieldStateList(fieldStateList.map((state, index) => !selectedFields.includes(`field_${index}_selector`) ? state : false));
    fieldSelectors.forEach(input => { input.checked = false; });
    document.getElementById('all_fields_selector').checked = false;
    showToast('Success', `${selectedFields.length} selected fields removed successfully`, 'bg-success');
  };

  const addCustomId = () => {
    setCustomIdList([...customIdList, { type: 'fixed', value: 'ABC' }]);
  };

  const removeCustomId = (index) => {
    const updatedList = customIdList.filter((_, i) => i !== index);
    setCustomIdList(updatedList);
  };

  const addFieldType = (index, type) => {
    const fieldTypeInputsValues = Array.from(document.querySelectorAll('.field_type')).map(input => {
      if (input.type === 'checkbox') return input.checked;
      if (input.type === 'file') return input.files;
      return input.value;
    });
    const fieldTypeValuesCount = fieldTypeInputsValues.reduce((acc, type) => {
      if (type === '') return acc;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    for (const type in fieldTypeValuesCount) {
      if (fieldTypeValuesCount[type] > 3) {
        showToast('Limit reached', 'There can be only the most 3 fields of any type', 'bg-warning');
        setFieldTypeList(list => list.map((item, i) => i === index ? '' : item));
        return;
      }
    }
    setFieldTypeList(list => list.map((item, i) => i === index ? type : item));
  }

  const selectAllFields = () => {
    const allFieldsSelector = document.getElementById('all_fields_selector');
    const fieldSelectors = document.querySelectorAll('.field_selector');
    fieldSelectors.forEach(input => {
      input.checked = allFieldsSelector.checked;
    });
  }

  const handleOpenInventory = (id) => {
    if (!openedInventories.includes(id)) setOpenedInventories([...openedInventories, id]);
  };

  function customIdGenerator(custom_ids, sequenceNumber) {
    let customId = '';
    custom_ids.map((_, i) => {
      if (custom_ids[i][0] === 'fixed') {
        customId += custom_ids[i][1];
      }
      else if (custom_ids[i][0] === '20-bit-random-number') {
        if (custom_ids[i][1] === 'D6') {
          customId += Math.floor(100000 + Math.random() * 900000).toString();
        }
        else if (custom_ids[i][1] === 'X5') {
          customId += Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(5, '0');
        }
      }
      else if (custom_ids[i][0] === '32-bit-random-number') {
        if (custom_ids[i][1] === 'D10') {
          customId += Math.floor(1000000000 + Math.random() * 9000000000).toString();
        }
        else if (custom_ids[i][1] === 'X8') {
          customId += Math.floor(Math.random() * 0x10000000).toString(16).toUpperCase().padStart(8, '0');
        }
      }
      else if (custom_ids[i][0] === '6-digit-random-number') {
        if (custom_ids[i][1] === 'D6')
          customId += Math.floor(100000 + Math.random() * 900000).toString();
        else if (custom_ids[i][1] === 'X6')
          customId += Math.floor(Math.random() * 0x100000).toString(16).toUpperCase().padStart(6, '0');
      }
      else if (custom_ids[i][0] === '9-digit-random-number') {
        if (custom_ids[i][1] === 'D9')
          customId += Math.floor(100000000 + Math.random() * 900000000).toString();
        else if (custom_ids[i][1] === 'X9')
          customId += Math.floor(Math.random() * 0x100000000).toString(16).toUpperCase().padStart(9, '0');
      }
      else if (custom_ids[i][0] === 'guid') {
        customId += 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }).toUpperCase();
      }
      else if (custom_ids[i][0] === 'date/time') {
        const date = new Date();
        const formatValues = {
          yyyy: date.getFullYear(),
          mm: String(date.getMonth() + 1).padStart(2, '0'),
          dd: String(date.getDate()).padStart(2, '0'),
          ddd: date.toLocaleString('en-US', { weekday: 'short' }),
          hh: String(date.getHours()).padStart(2, '0'),
          mmm: String(date.getMinutes()).padStart(2, '0'),
        };
        const formatString = custom_ids[i][1];
        customId += formatString.replace(/yyyy|mm|dd|ddd|hh|mmm/g, match => formatValues[match]);
      }
      else if (custom_ids[i][0] === 'sequence') {
        if (custom_ids[i][1] === 'D4') {
          customId += String(sequenceNumber).padStart(4, '0');
        }
        else if (custom_ids[i][1] === 'D') {
          customId += String(sequenceNumber);
        }
      }
      if (i != custom_ids.length - 1) {
        customId += '_';
      }
    });
    return customId;
  };

  function getFieldTypeElement(fieldName, fieldType) {
    if (fieldType === 'string') {
      return <input type="text" className='new-item-field' data-field-type={fieldName} />;
    }
    else if (fieldType === 'text') {
      return <textarea className='new-item-field' data-field-type={fieldName} />;
    }
    else if (fieldType === 'number') {
      return <input type="number" className='new-item-field' data-field-type={fieldName} />;
    }
    else if (fieldType === 'boolean') {
      return <input type="checkbox" className='new-item-field' data-field-type={fieldName} />;
    }
    else if (fieldType === 'file') {
      return <input type="file" className='new-item-field' data-field-type={fieldName} />;
    }
  }

  const handleSelectAllItems = () => {
    const allItemsSelector = document.querySelector('.items-all-selector');
    const itemSelectors = document.querySelectorAll('.item-selector');
    itemSelectors.forEach(input => {
      input.checked = allItemsSelector.checked;
    });
  }

  const handleDeleteSelectedItems = (inventoryId) => {
    const itemSelectors = document.querySelectorAll('.item-selector');
    const selectedItemIds = Array.from(itemSelectors).filter(input => input.checked).map(input => parseInt(input.dataset.itemId));
    console.log(selectedItemIds);
    if (selectedItemIds.length === 0) {
      showToast('Warning', 'No items selected', 'bg-warning');
      return;
    }
    showToast(
      'Warning',
      'Are you sure you want to delete selected items? This action cannot be undone.',
      'bg-warning',
      () => {
        Promise.all(selectedItemIds.map(itemId =>
          fetch(`/api/items`, {

            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: itemId }),
          })
        )).then(responses => {
          if (responses.some(res => !res.ok)) {
            throw new Error('Network response was not ok');
          }
          setItemsByInventoryId(prev => ({
            ...prev,
            [inventoryId]: prev[inventoryId].filter(item => !selectedItemIds.includes(item.id))
          }));
          console.log(itemsByInventoryId);
          showToast('Success', "Items deleted successfully", 'bg-success');
          document.querySelector('.items-all-selector').checked = false;
          itemSelectors.forEach(input => {
            input.checked = false;
          });
        }).catch(err => {
          showToast('Error', 'Failed to delete selected items', 'bg-danger');
        });
      }
    );
  }

  const addUserToAccess = async (inventory_id) => {
    if (!newUserInput.trim()) {
      showToast('Input required', 'Please enter a user ID, name or email.', 'bg-warning');
      return;
    }
    const res = await fetch(`/api/inventories/${inventory_id}/add-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdentifier: newUserInput.trim() }),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
      setHasAccess(data.has_access);
      setNewUserInput('');
      showToast('Success', 'User added to access list.', 'bg-success');
    } else {
      showToast('Error', 'Failed to add user.', 'bg-danger');
    }
  };

  return (
    <div>
      <LightDarkSwitch />
      {/* <LanguageSelect /> */}
      {isLoggedIn && (
        <button
          className="btn btn-secondary logout_btn"
          onClick={async () => {
            await fetch('/api/logout', {
              method: 'POST',
              credentials: 'include'
            });
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      )}
      <h1 data-translate>Dashboard</h1>
      <Tabs
        activeKey={activeTab}
        onSelect={key => setActiveTab(key)}
        id="uncontrolled-tab"
        className="tabs mb-3"
        data-translate
      >
        <Tab eventKey="home" title="Home" className='tab'>
          <p data-translate>Public inventories:</p>
          <div className="inventories-container">
            <table className='table public-inventories'>
              <thead>
                <tr>
                  <th scope='col' data-translate>#</th>
                  <th scope='col' data-translate>Title</th>
                  <th scope='col' data-translate>Category</th>
                  <th scope='col' data-translate>Tags</th>
                </tr>
              </thead>
              <tbody>
                {inventories.filter(inventory => inventory.is_public).map((inventory, index) => (
                  <tr key={inventory.id || index} onClick={() => handleOpenInventory(inventory.id)} title={inventory.description} className="home_inventory_row">
                    <td>{index + 1}</td>
                    <td>{inventory.title}</td>
                    <td>{inventory.category}</td>
                    <td title={inventory.tags}>{inventory.tags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p data-translate>Inventories you have access to:</p>
            {isLoggedIn && (
              <table className="table accessible-inventories">
                <thead>
                  <tr>
                    <th scope='col' data-translate>#</th>
                    <th scope='col' data-translate>Title</th>
                    <th scope='col' data-translate>Category</th>
                    <th scope='col' data-translate>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.filter(inventory => inventory.has_access.includes(user.user_id)).map((inventory, index) => (
                    <tr key={inventory.id || index} onClick={() => handleOpenInventory(inventory.id)} title={inventory.description} className="home_inventory_row">
                      <td>{index + 1}</td>
                      <td>{inventory.title}</td>
                      <td>{inventory.category}</td>
                      <td title={inventory.tags}>{inventory.tags}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Tab>
        {isLoggedIn && (
          <Tab eventKey="profile" title="Profile" className='tab'>
            <p data-translate>Welcome to the profile tab!</p>
            <p data-translate><strong>Name:</strong> {user.displayName}</p>
            <p data-translate><strong>Email:</strong> {user?.email}</p>
            <p data-translate>Your inventories:</p>
            <table className="table accessible-inventories">
              <thead>
                <tr>
                  <th scope='col' data-translate>#</th>
                  <th scope='col' data-translate>Title</th>
                  <th scope='col' data-translate>Category</th>
                  <th scope='col' data-translate>Tags</th>
                </tr>
              </thead>
              <tbody>
                {inventories.filter(inventory => inventory.owner_id === user.user_id).map((inventory, index) => (
                  <tr key={inventory.id || index} onClick={() => handleOpenInventory(inventory.id)} title={inventory.description} className="home_inventory_row">
                    <td>{index + 1}</td>
                    <td>{inventory.title}</td>
                    <td>{inventory.category}</td>
                    <td title={inventory.tags}>{inventory.tags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tab>
        )}
        {isLoggedIn && (
          <Tab eventKey="new_inventory" title="New Inventory" className='tab new-inventory-tab'>
            <Tabs className='tabs new-inventory-tabs'>
              <Tab eventKey="details" title="Details">
                <form onSubmit={handleCreateInventory}>
                  <div className="mb-3">
                    <label htmlFor="new-title" className="form-label" data-translate>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="new-title"
                      placeholder="Enter title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-description" className="form-label" data-translate>Description</label>
                    <textarea
                      className="form-control"
                      id="new-description"
                      rows="3"
                      placeholder="Enter description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-category" className="form-label" data-translate>Category</label>
                    <input
                      type="text"
                      className="form-control"
                      id="new-category"
                      placeholder="Enter category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-tags" className="form-label" data-translate>Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      id="new-tags"
                      placeholder="Enter tags (comma separated)"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="new-image" className="form-label" data-translate>Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id="new-image"
                      placeholder="Enter image URL (optional)"
                      value={image}
                      onChange={e => setImage(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="is-public" className="form-label" data-translate>Is Public</label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is-public"
                      checked={isPublic}
                      onChange={e => setIsPublic(e.target.checked)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" data-translate>Create Inventory</button>
                </form>
              </Tab>
              <Tab eventKey="fields" title="Fields" className='tab new-fields-tab'>
                <p data-translate>Create custom fields for your inventory items.</p>
                <button className='btn btn-danger' onClick={handleRemoveSelectedFields} data-translate>Remove Selected Fields</button>
                <table className='field-table'>
                  <thead>
                    <tr>
                      <th scope='col' data-translate>#</th>
                      <th scope='col'>
                        <input type="checkbox" name={`all_fields_selector`} id={`all_fields_selector`} className='form-check-input all_fields_selector' onChange={selectAllFields} />
                        <span data-translate>Field Name</span>
                      </th>
                      <th scope='col' data-translate>Field Type</th>
                      <th scope='col' data-translate>Is Public</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldStateList.filter(item => item === true).map((_, index) => (
                      <tr key={`field-${index}`}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="table-flex-cell">
                            <input type="checkbox" name={`field_${index}_selector`} id={`field_${index}_selector`} className='form-check-input field_selector' />
                            <div className="mb-3">
                              <input
                                type="text"
                                className="form-control field_name"
                                id={`new-field-name-${index}`}
                                placeholder="Enter field name"
                                value={fieldNameList[index]}
                                onChange={e => handleFieldNameChange(index, e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="mb-3">
                            <select
                              className="form-select field_type"
                              id="new-field-type"
                              value={fieldTypeList[index]}
                              onChange={event => addFieldType(index, event.target.value)}
                              required
                            >
                              <option value="">Select field type</option>
                              <option value="string">String</option>
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="file">File</option>
                            </select>
                          </div>
                        </td>
                        <td>
                          <input type="checkbox" name={`field_${index}_is_public`} id={`field_${index}_is_public`} className='form-check-input field_is_public' />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="btn btn-add-field" onClick={handleAddField} data-translate>Add Field</button>
              </Tab>
              <Tab eventKey="custom_id" title="Custom ID" className='tab new-custom-id-tab'>
                <p>You can set up numbers for your items as you prefer.</p>
                <i className="bi bi-trash div-drag-delete" title="Drag here to delete Custom ID"
                  onDragEnter={(event) => {
                    event.preventDefault();
                    if (draggingIndex !== null) {
                      document.querySelectorAll(".custom-id-container")[draggingIndex].classList.add("custom-id-drag-delete");
                    }
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    if (draggingIndex !== null) {
                      document.querySelectorAll(".custom-id-container")[draggingIndex].classList.remove("custom-id-drag-delete");
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggingIndex === null) return;
                    document.querySelectorAll('.custom-id-container').forEach(container => {
                      container.classList.remove("custom-id-drag-delete");
                    });
                    const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
                    removeCustomId(fromIndex);
                    setDraggingIndex(null);
                  }}
                  onDragEnd={() => {
                    document.querySelectorAll('.custom-id-container').forEach(container => {
                      container.classList.remove(["custom-id-drag-over", "custom-id-drag-delete"]);
                    });
                  }}></i>
                <div className="custom-id-settings">
                  {customIdList.map((item, idx) => (
                    <div key={idx} className="custom-id-container d-flex align-items-center mb-2" draggable="true"
                      onDragStart={event => {
                        setDraggingIndex(idx);
                        event.dataTransfer.setData("text/plain", idx);
                      }}
                      onDragOver={event => event.preventDefault()}
                      onDragEnter={event => {
                        event.preventDefault();
                        const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
                        const toIndex = idx;
                        if (fromIndex !== toIndex) event.currentTarget.classList.add('custom-id-drag-over');
                      }}
                      onDragLeave={event => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                          event.currentTarget.classList.remove("custom-id-drag-over");
                        }
                      }}
                      onDrop={event => {
                        event.preventDefault();
                        const fromIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);
                        const toIndex = idx;
                        if (fromIndex !== toIndex) {
                          const updatedList = [...customIdList];
                          const [movedItem] = updatedList.splice(fromIndex, 1);
                          updatedList.splice(toIndex, 0, movedItem);
                          setCustomIdList(updatedList);
                        }
                      }}
                      onDragEnd={() => {
                        document.querySelectorAll('.custom-id-container').forEach(container => {
                          container.classList.remove("custom-id-drag-over");
                        });
                      }}
                    >
                      <div className="div-drag-icon"><i className="bi bi-arrow-down-up"></i></div>
                      <select
                        name={`custom-id-${idx}-type`}
                        className="form-select me-2 custom-id-select"
                        value={item.type}
                        onChange={e => handleCustomIdChange(idx, 'type', e.target.value)}
                      >
                        <option value="fixed">Fixed</option>
                        <option value="20-bit-random-number">20-bit random number</option>
                        <option value="32-bit-random-number">32-bit random number</option>
                        <option value="6-digit-random-number">6 digit random number</option>
                        <option value="9-digit-random-number">9 digit random number</option>
                        <option value="guid">GUID</option>
                        <option value="date/time">Date/time</option>
                        <option value="sequence">Sequence</option>
                      </select>
                      {item.type === 'fixed' ? (
                        <input
                          name={`custom-id-${idx}-value`}
                          type="text"
                          className="form-control me-2 custom-id-input"
                          value={item.value.concat("-")}
                          onChange={e => handleCustomIdChange(idx, 'value', e.target.value.slice(0, -1))}
                          placeholder="Custom ID value"
                          maxLength={16}
                        />
                      ) : (
                        <select
                          name={`custom-id-${idx}-format`}
                          className="form-select me-2 custom-id-select"
                          value={item.value}
                          onChange={e => handleCustomIdChange(idx, 'value', e.target.value)}
                        >
                          {(customIdFormatting[customIdFormattingIndexes[item.type]] || []).map((format, formatIdx) => (
                            <option key={formatIdx} value={format}>{format}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary mt-2" onClick={customIdList.length < 10 ? addCustomId : () => showToast('Limit reached', 'You can only add up to 10 custom IDs.', 'bg-warning')}>
                    Add Custom ID
                  </button>
                </div>
              </Tab>
            </Tabs>
          </Tab>)}
        {inventories.filter(inventory => openedInventories.includes(inventory.id)).map((inventory) => (
          <Tab className="tab inventory-tab" eventKey={`inventory_${inventory.id}`} key={inventory.id}
            title={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {inventory.title}
                <i
                  className="bi bi-x ms-2"
                  role="button"
                  aria-label="Close"
                  style={{ fontSize: '0.8em', marginLeft: 8 }}
                  onClick={e => {
                    e.stopPropagation();
                    setOpenedInventories(openedInventories.filter(id => id !== inventory.id));
                    if (activeTab === `inventory_${inventory.id}`) {
                      const remaining = inventories.filter(inv => openedInventories.includes(inv.id) && inv.id !== inventory.id);
                      if (remaining.length > 0) setActiveTab(`inventory_${remaining[0].id}`);
                      else setActiveTab('home');
                    }
                  }}
                ></i>
              </span>
            } >
            <p>Inventory {inventory.title}</p>
            <br />
            <h2>Items</h2>
            {isLoggedIn && inventory.has_access.includes(user.user_id) && (
              <button className='btn btn-danger' onClick={() => handleDeleteSelectedItems(inventory.id)}>Delete Selected Items</button>
            )}
            <table>
              <thead>
                <tr>
                  <th>
                    {isLoggedIn && inventory.has_access.includes(user.user_id) && (
                      <input type="checkbox" name={"items-all-selector"} className={"items-all-selector"} onChange={handleSelectAllItems} />
                    )}
                    #
                  </th>
                  {Object.values(inventory.custom_ids || {}).length !== 0 && <th>ID</th>}
                  {Object.keys(inventory.custom_fields || {}).map((fieldName, index) => (
                    <th key={`${fieldName}-${index}`}>{fieldName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.entries(itemsByInventoryId[inventory.id] || {})).map(([itemId, item]) => (
                  <tr key={`item-field-${item.id}`}>
                    <td>
                      {isLoggedIn && inventory.has_access.includes(user.user_id) ? (
                        <input type="checkbox" name={"item-selector"} className={"item-selector"} data-item-id={item.id} />
                      ) : null}
                      {parseInt(itemId) + 1}
                    </td>
                    {Object.values(inventory.custom_ids || {}).length !== 0 && <td>{item.custom_id}</td>}
                    {Object.values(item.custom_fields).map(fieldValue => (
                      <td>{fieldValue}</td>
                    ))}
                  </tr>
                ))}
                {isLoggedIn && inventory.has_access.includes(user.user_id) && (
                  <tr>
                    <td>
                      <button className="btn btn-primary" onClick={() => addItem(inventory.id)}><b>+</b></button>
                    </td>
                    {Object.values(inventory.custom_ids || {}).length !== 0 && <td id="new-item-custom-id">{customIdGenerator(Object.entries(inventory.custom_ids || {}), 1)}</td>}
                    {Object.entries(inventory.custom_fields || {}).map(([fieldName, fieldType]) => (
                      <td key={`${fieldName}-${fieldType}`}>
                        {getFieldTypeElement(fieldName, fieldType)}
                      </td>
                    ))}
                    <td colSpan={Object.keys(inventory.custom_fields || {}).length + 2}>
                      <input type="checkbox" name='new-item-is-public' id='new-item-is-public' />
                    </td>
                  </tr>)}
              </tbody>
            </table>
            {isLoggedIn && inventory.has_access.includes(user.user_id) && (
              <div>
                <label htmlFor="new-inventory-new-user-input">Users with access to the inventory</label>
                <br />
                <ul>
                  {hasAccess.map(userId => (
                    <li key={userId}>{userId}</li>
                  ))}
                </ul>
                <input
                  type="text"
                  placeholder="Type user ID, name or email"
                  id="new-inventory-new-user-input"
                  value={newUserInput}
                  onChange={e => setNewUserInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => addUserToAccess(inventory.id)}
                >
                  Add User
                </button>
              </div>)}
          </Tab>
        ))}
      </Tabs >

      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
        <div
          className={`toast ${toast.show ? 'show' : null}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className={`toast-header ${toast.headerClass}`}>
            <strong className="me-auto" data-translate>{toast.title}</strong>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setToast({ ...toast, show: false })}
            ></button>
          </div>
          <div className="toast-body">
            <span data-translate>{toast.message}</span>
            {toast.confirmCallback && (
              <div className="mt-2 d-flex justify-content-end">
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => {
                    toast.confirmCallback();
                    setToast({ ...toast, show: false });
                  }}
                  data-translate
                >
                  Confirm
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setToast({ ...toast, show: false })}
                  data-translate
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}

export default DashboardPage;
