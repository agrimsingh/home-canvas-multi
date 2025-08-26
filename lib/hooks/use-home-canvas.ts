import { useReducer, useCallback } from "react";
import { Product, PlacedProduct } from "@/lib/types";

type State = {
  uploadedProducts: Product[];
  placedProducts: PlacedProduct[];
  draggedProduct: Product | null;
  sceneImage: File | null;
  isLoading: boolean;
  error: string | null;
  loadingMessageIndex: number;
  debugImageUrl: string | null;
  debugPrompt: string | null;
};

type Action =
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "SET_DRAGGED_PRODUCT"; product: Product | null }
  | { type: "ADD_PLACED_PRODUCT"; placedProduct: PlacedProduct }
  | { type: "REMOVE_PLACED_PRODUCT"; placementId: string }
  | { type: "SET_SCENE_IMAGE"; image: File | null }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_LOADING_MESSAGE_INDEX"; index: number }
  | {
      type: "SET_DEBUG_INFO";
      debugImageUrl: string | null;
      debugPrompt: string | null;
    }
  | { type: "RESET" }
  | { type: "CLEAR_PLACEMENTS" };

const initialState: State = {
  uploadedProducts: [],
  placedProducts: [],
  draggedProduct: null,
  sceneImage: null,
  isLoading: false,
  error: null,
  loadingMessageIndex: 0,
  debugImageUrl: null,
  debugPrompt: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_PRODUCT":
      return {
        ...state,
        uploadedProducts: [...state.uploadedProducts, action.product],
      };

    case "SET_DRAGGED_PRODUCT":
      return { ...state, draggedProduct: action.product };

    case "ADD_PLACED_PRODUCT":
      return {
        ...state,
        placedProducts: [...state.placedProducts, action.placedProduct],
      };

    case "REMOVE_PLACED_PRODUCT":
      return {
        ...state,
        placedProducts: state.placedProducts.filter(
          (p) => p.id !== action.placementId
        ),
      };

    case "SET_SCENE_IMAGE":
      return { ...state, sceneImage: action.image };

    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_LOADING_MESSAGE_INDEX":
      return { ...state, loadingMessageIndex: action.index };

    case "SET_DEBUG_INFO":
      return {
        ...state,
        debugImageUrl: action.debugImageUrl,
        debugPrompt: action.debugPrompt,
      };

    case "CLEAR_PLACEMENTS":
      return { ...state, placedProducts: [] };

    case "RESET":
      // Clean up blob URLs before resetting
      state.uploadedProducts.forEach((product) => {
        if (product.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
      return initialState;

    default:
      return state;
  }
}

export function useHomeCanvas() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addProduct = useCallback((file: File) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      const product: Product = {
        id: `product-${Date.now()}-${Math.random()}`,
        name: file.name,
        imageUrl: imageUrl,
        file: file,
      };
      dispatch({ type: "ADD_PRODUCT", product });
      dispatch({ type: "SET_ERROR", error: null });
      return product;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      dispatch({
        type: "SET_ERROR",
        error: `Could not load the product image. Details: ${errorMessage}`,
      });
      throw err;
    }
  }, []);

  const setDraggedProduct = useCallback((product: Product | null) => {
    dispatch({ type: "SET_DRAGGED_PRODUCT", product });
  }, []);

  const addPlacedProduct = useCallback(
    (
      product: Product,
      position: { x: number; y: number },
      relativePosition: { xPercent: number; yPercent: number }
    ) => {
      const placedProduct: PlacedProduct = {
        id: `placement-${Date.now()}-${Math.random()}`,
        product,
        position,
        relativePosition,
      };
      dispatch({ type: "ADD_PLACED_PRODUCT", placedProduct });
      dispatch({ type: "SET_ERROR", error: null });
    },
    []
  );

  const removePlacedProduct = useCallback((placementId: string) => {
    dispatch({ type: "REMOVE_PLACED_PRODUCT", placementId });
  }, []);

  const setSceneImage = useCallback((image: File | null) => {
    dispatch({ type: "SET_SCENE_IMAGE", image });
    if (!image) {
      dispatch({ type: "CLEAR_PLACEMENTS" });
      dispatch({
        type: "SET_DEBUG_INFO",
        debugImageUrl: null,
        debugPrompt: null,
      });
    }
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", error });
  }, []);

  const setLoadingMessageIndex = useCallback((index: number) => {
    dispatch({ type: "SET_LOADING_MESSAGE_INDEX", index });
  }, []);

  const setDebugInfo = useCallback(
    (debugImageUrl: string | null, debugPrompt: string | null) => {
      dispatch({ type: "SET_DEBUG_INFO", debugImageUrl, debugPrompt });
    },
    []
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const clearPlacements = useCallback(() => {
    dispatch({ type: "CLEAR_PLACEMENTS" });
  }, []);

  return {
    state,
    actions: {
      addProduct,
      setDraggedProduct,
      addPlacedProduct,
      removePlacedProduct,
      setSceneImage,
      setLoading,
      setError,
      setLoadingMessageIndex,
      setDebugInfo,
      reset,
      clearPlacements,
    },
  };
}
