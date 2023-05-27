import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import {
  getAllProduct,
  productByMake,
  productByModel,
  productByPrice,
  productByVariant,
} from "../../admin/products/FetchApi";

import Select from "react-select";
import { uniqBy } from "lodash";
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;

const CategoryList = () => {
  const history = useHistory();
  const { data } = useContext(HomeContext);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setCategories(responseData.Categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`${data.categoryListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="py-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories && categories.length > 0 ? (
          categories.map((item, index) => {
            return (
              <Fragment key={index}>
                <div
                  onClick={(e) =>
                    history.push(`/products/category/${item._id}`)
                  }
                  className="col-span-1 m-2 flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <img
                    src={`${apiURL}/uploads/categories/${item.cImage}`}
                    alt="pic"
                  />
                  <div className="font-medium">{item.cName}</div>
                </div>
              </Fragment>
            );
          })
        ) : (
          <div className="text-xl text-center my-4">No Category</div>
        )}
      </div>
    </div>
  );
};

const FilterList = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [range, setRange] = useState(0);
  const [{ products, pCategories, pVariants, pModels, pMakes }, setState] =
    useState({
      products: {},
      pCategories: {},
      pVariants: {},
      pModals: {},
      pMakes: {},
    });
  const [{ selectedMake, selectedModel, selectedVariant }, setFilterData] =
    useState({
      selectedMake: null,
      selectedModel: null,
      selectedVariant: null,
    });
  const rangeHandle = (e) => {
    setRange(e.target.value);
    applyFilter("Price", e.target.value);
  };
  const fetchFilterData = async () => {
    let { Products } = await getAllProduct();
    let variants = [];
    let makes = [];
    let models = [];

    Products.forEach((product) => {
      if (product.pVariant) {
        variants = [
          ...variants,
          { value: product.pVariant, label: product.pVariant },
        ];
      }
      if (product.pMake) {
        makes = [...makes, { value: product.pMake, label: product.pMake }];
      }
      if (product.pModel) {
        models = [...models, { value: product.pModel, label: product.pModel }];
      }
    });

    variants = uniqBy(variants, "value");
    makes = uniqBy(makes, "value");
    models = uniqBy(models, "value");

    setState((currentState) => ({
      ...currentState,
      pVariants: variants,
      pMakes: makes,
      pModels: models,
    }));
  };
  useEffect(() => {
    fetchFilterData();
  }, []);

  const applyFilter = async (type, value) => {
    dispatch({ type: "loading", payload: true });
    let responseData = [];
    if (type === "Model") {
      responseData = await productByModel(value);
    }
    if (type === "Variant") {
      responseData = await productByVariant(value);
    }
    if (type === "Make") {
      responseData = await productByMake(value);
    }
    if (type === "Price") {
      responseData = await productByPrice(value);
    }
    dispatch({ type: "setProducts", payload: responseData.Products });
    dispatch({ type: "loading", payload: false });
  };
  const fetchData = async (price) => {
    if (price === "all") {
      try {
        let responseData = await getAllProduct();
        if (responseData && responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      dispatch({ type: "loading", payload: true });
      try {
        setTimeout(async () => {
          let responseData = await productByPrice(price);
          if (responseData && responseData.Products) {
            dispatch({ type: "setProducts", payload: responseData.Products });
            dispatch({ type: "loading", payload: false });
          }
        }, 700);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const closeFilterBar = () => {
    setFilterData({
      selectedMake: null,
      selectedVariant: null,
      selectedModel: null,
    });
    fetchData("all");
    dispatch({ type: "filterListDropdown", payload: !data.filterListDropdown });
    setRange(0);
  };

  return (
    <div className={`${data.filterListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full flex flex-row">
        <div className="w-2/3">
          <div className="font-medium py-2">Filter by price</div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2  w-2/3 lg:w-2/4">
              <label htmlFor="points" className="text-sm">
                Price (between 0 and 10$):{" "}
                <span className="font-semibold text-yellow-700">
                  {range}.00$
                </span>{" "}
              </label>
              <input
                value={range}
                className="slider"
                type="range"
                id="points"
                min="0"
                max="1000"
                step="10"
                onChange={(e) => rangeHandle(e)}
              />
            </div>
          </div>
        </div>
        <div className="w-2/3 mx-2">
          <div className="font-medium py-2">Filter by Variant</div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2  w-2/3 lg:w-2/4">
              <Select
                options={pVariants || []}
                value={selectedVariant}
                onChange={(e) => {
                  setFilterData((currentState) => ({
                    ...currentState,
                    selectedVariant: e,
                    selectedMake: null,
                    selectedModel: null,
                  }));
                  setRange(0);
                  applyFilter("Variant", e.value);
                }}
                hasSelectAll={false}
                labelledBy={""}
              />
            </div>
            <div onClick={(e) => closeFilterBar()} className="cursor-pointer">
              <svg
                className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-row">
        <div className="w-2/3 mx-2">
          <div className="font-medium py-2">Filter by Make</div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2  w-2/3 lg:w-2/4">
              <Select
                options={pMakes || []}
                value={selectedMake}
                onChange={(e) => {
                  setFilterData((currentState) => ({
                    ...currentState,
                    selectedVariant: null,
                    selectedMake: e,
                    selectedModel: null,
                  }));
                  setRange(0);
                  applyFilter("Make", e.value);
                }}
                hasSelectAll={false}
                labelledBy={""}
              />
            </div>
          </div>
        </div>
        <div className="w-2/3 mx-2">
          <div className="font-medium py-2">Filter by Model</div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2  w-2/3 lg:w-2/4">
              <Select
                options={pModels || []}
                value={selectedModel}
                onChange={(e) => {
                  setFilterData((currentState) => ({
                    ...currentState,
                    selectedVariant: null,
                    selectedMake: null,
                    selectedModel: e,
                  }));
                  setRange(0);
                  applyFilter("Model", e.value);
                }}
                hasSelectAll={false}
                isMulti={false}
                labelledBy={""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [search, setSearch] = useState("");
  const [productArray, setPa] = useState(null);

  const searchHandle = (e) => {
    setSearch(e.target.value);
    fetchData();
    dispatch({
      type: "searchHandleInReducer",
      payload: e.target.value,
      productArray: productArray,
    });
  };

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      setTimeout(async () => {
        let responseData = await getAllProduct();
        if (responseData && responseData.Products) {
          setPa(responseData.Products);
          dispatch({ type: "loading", payload: false });
        }
      }, 700);
    } catch (error) {
      console.log(error);
    }
  };

  const closeSearchBar = () => {
    dispatch({ type: "searchDropdown", payload: !data.searchDropdown });
    fetchData();
    dispatch({ type: "setProducts", payload: productArray });
    setSearch("");
  };

  return (
    <div
      className={`${
        data.searchDropdown ? "" : "hidden"
      } my-4 flex items-center justify-between`}
    >
      <input
        value={search}
        onChange={(e) => searchHandle(e)}
        className="px-4 text-xl py-4 focus:outline-none"
        type="text"
        placeholder="Search products..."
      />
      <div onClick={(e) => closeSearchBar()} className="cursor-pointer">
        <svg
          className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <FilterList />
      <Search />
    </Fragment>
  );
};

export default ProductCategoryDropdown;
