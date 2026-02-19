import { inventoryAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


//-----------------------------------
// :: initialState list
//-----------------------------------

/*
This code defines the initial state object for a component or reducer, 
setting default values for `items`, `currentItem`, `loading`, and `error`.
*/


const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};



//-----------------------------------
// :: fetchAllItems Function
//-----------------------------------

/*
This code defines an asynchronous Redux thunk (`fetchAllItems`) that fetches
inventory items from an API, returns the results if successful, and handles errors using `rejectWithValue`.
*/


export const fetchAllItems = createAsyncThunk(
  'inventory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await inventoryAPI.list();
      return data.results ?? [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//-----------------------------------
// :: fetchItem Function
//-----------------------------------

/*
This code defines an asynchronous Redux thunk (`fetchItem`) that retrieves a 
single inventory item by its ID from an API, returning the item data on success and handling errors using `rejectWithValue`.
*/


export const fetchItem = createAsyncThunk(
  'inventory/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await inventoryAPI.retrieve(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//-----------------------------------
// :: createItem Function
//-----------------------------------

/*
This code defines an asynchronous Redux thunk (`createItem`) that sends new inventory item data to an API 
to create the item, returning the created item on success and handling errors using `rejectWithValue`.
*/


export const createItem = createAsyncThunk(
  'inventory/create',
  async (itemData, { rejectWithValue }) => {
    try {
      const { data } = await inventoryAPI.create(itemData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//-----------------------------------
// :: updateItem Function
//-----------------------------------

/*
This code defines an asynchronous Redux thunk (`updateItem`) that updates an existing 
inventory item by ID using an API call, returning the updated item data on success and handling errors with 
`rejectWithValue`.
*/


export const updateItem = createAsyncThunk(
  'inventory/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: updated } = await inventoryAPI.update(id, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//-----------------------------------
// :: patchItem Function
//-----------------------------------

/*
This code defines an asynchronous Redux thunk (`patchItem`) that partially updates an inventory item by ID using a 
PATCH API call, returning the patched item data on success and handling errors with `rejectWithValue`.
*/


export const patchItem = createAsyncThunk(
  'inventory/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: patched } = await inventoryAPI.patch(id, data);
      return patched;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//-----------------------------------
// :: deleteItem function
//-----------------------------------

/*
This code defines an asynchronous Redux thunk (`deleteItem`) that deletes an inventory item by ID via an API call, 
returning the deleted item's ID on success and handling errors with `rejectWithValue`.
*/

export const deleteItem = createAsyncThunk(
  'inventory/delete',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


//-----------------------------------
// :: inventorySlice Function
//-----------------------------------

/*
This code defines a Redux slice for inventory management, including state, synchronous reducers, and asynchronous extra reducers to handle CRUD 
actions and update loading/error status accordingly.
*/

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,

  //-----------------------------------
  // :: reducers
  //-----------------------------------

  /*
  This section defines synchronous Redux reducers to set or clear the current item and to clear any error state.
  */

  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  //-----------------------------------
  // :: extra Reducers
  //-----------------------------------

  /*
This extraReducers block handles the asynchronous lifecycle of inventory API actions (pending, fulfilled, rejected) to update the loading state, 
store fetched data, and manage errors accordingly.
  */

  extraReducers: (builder) => {
    builder


      //-----------------------------------
      // :: fetchAllItems Case
      //-----------------------------------

      /*
      This code handles the fetchAllItems async action by setting loading state during the request, storing the retrieved items
       on success, and saving any error message on failure.
      */

      .addCase(fetchAllItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchAllItems.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })


      //-----------------------------------
      // :: fetchItem Case
      //-----------------------------------

      /*
      This code handles the fetchItem async action by setting loading state while the request is pending, storing the retrieved item in currentItem 
      on success, and saving any error message on failure.
      */

      .addCase(fetchItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentItem = payload;
      })
      .addCase(fetchItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })



      //-----------------------------------
      // :: createItem Case
      //-----------------------------------

      /*
      This code handles the createItem async action by enabling loading state during creation, 
      adding the new item to the list on success, and storing any error message on failure.
      */

      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items.push(payload);
      })
      .addCase(createItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })



      //-----------------------------------
      // :: updateItem Case
      //-----------------------------------

      /*
      This code handles the updateItem async action by setting the loading state, updating the item in the list and current 
      item on success, and storing any error message on failure.
      */

      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) state.items[index] = payload;
        if (state.currentItem?.id === payload.id) state.currentItem = payload;
      })
      .addCase(updateItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      //-----------------------------------
      // :: patchItem Case
      //-----------------------------------

      /*
      This code handles the patchItem async action by setting the loading state, updating the existing item (and current item if 
      applicable) on success, and storing any error message on failure.
      */

      .addCase(patchItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) state.items[index] = payload;
        if (state.currentItem?.id === payload.id) state.currentItem = payload;
      })
      .addCase(patchItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })


      //-----------------------------------
      // :: deleteItem Case
      //-----------------------------------

      /*
      This code handles the deleteItem async action by setting loading state, removing the deleted item from the list 
      (and clearing the current item if needed) on success, and storing any error message on failure.
      */

      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== payload);
        if (state.currentItem?.id === payload) state.currentItem = null;
      })
      .addCase(deleteItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});


//-----------------------------------
// :: export inventory Slice
//-----------------------------------

/*
This line exports the `CatalogDesign` component as the default export from the file, allowing it to be 
imported and used in other parts of the application.
*/

export const { clearCurrentItem, setCurrentItem, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
