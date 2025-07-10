// Create: src/test-cva.js
import { cva } from "class-variance-authority"

console.log("CVA function:", cva)

const testVariant = cva("base-class", {
  variants: {
    variant: {
      default: "default-variant"
    }
  }
})

console.log("Test variant result:", testVariant())