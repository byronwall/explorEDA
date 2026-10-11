import { PADDLE } from "./config";

interface PaddleGlobal {
  Environment: { set(environment: "sandbox"): void };
  Initialize(options: {
    token: string;
    eventCallback?: (event: { name?: string }) => void;
  }): void;
  Checkout: {
    open(options: {
      items: Array<{ priceId: string; quantity: number }>;
      settings?: {
        displayMode?: "overlay";
        theme?: "light" | "dark";
        successUrl?: string;
        allowLogout?: boolean;
      };
    }): void;
  };
}

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

let loading: Promise<PaddleGlobal> | undefined;

/** Loads Paddle.js on first use, so pages without checkout never fetch it. */
function loadPaddle(): Promise<PaddleGlobal> {
  if (!PADDLE) return Promise.reject(new Error("Checkout is not set up"));
  const settings = PADDLE;
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      const paddle = window.Paddle;
      if (!paddle) {
        reject(new Error("Paddle.js did not load"));
        return;
      }
      if (settings.environment === "sandbox") paddle.Environment.set("sandbox");
      paddle.Initialize({ token: settings.token });
      resolve(paddle);
    };
    script.onerror = () => {
      loading = undefined;
      reject(new Error("Paddle.js did not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Opens Paddle's checkout overlay. The license email follows payment. */
export async function openCheckout(
  items: Array<{ product: "commercial" | "oem"; quantity: number }>
) {
  if (!PADDLE) throw new Error("Checkout is not set up");
  const paddle = await loadPaddle();
  const prices = PADDLE.prices;
  paddle.Checkout.open({
    items: items.flatMap(({ product, quantity }) => {
      const priceId = prices[product];
      return priceId && quantity > 0 ? [{ priceId, quantity }] : [];
    }),
    settings: {
      displayMode: "overlay",
      theme: document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
      successUrl: `${window.location.origin}/license?purchased=1#install`,
    },
  });
}
