export interface ISpoonQuantity {
    type: "spoon",
    value: number
}

export interface IWeight {

}

export enum WeightUnit { Kilogram, Gram}

export interface IWeightQuantity {
    type: "weight",
    value: number,
    unit: WeightUnit
}

export enum VolumeUnit {Mililiter}

export interface IVolumeQuantity {
    type: "volume",
    value: number,
    unit: VolumeUnit
}

export interface IOtherQuantity {
    type: "other",
    value: string
}

/**
 * sdf
 */
export type Quantity = IWeightQuantity | IVolumeQuantity | IOtherQuantity

export function scale(quantity: Quantity, scale: number): Quantity {
    switch (quantity.type) {
        case "volume":
            return {type: "volume", unit: quantity.unit, value: quantity.value * scale}
        case "weight":
            return {type: "weight", unit: quantity.unit, value: quantity.value * scale}
        case "other":
            return {type: "other", value: quantity.value + " * " + scale}
    }
}
