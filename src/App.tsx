import React, {ChangeEvent, FC, FormEvent, useState} from 'react';
import './App.css';
import './Firebase';
import {Button, Col, Form, Spinner, Table, Tabs} from 'react-bootstrap'
import Tab from "react-bootstrap/Tab";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useObjectVal} from "react-firebase-hooks/database";
import {productsRef} from "./Firebase";
import {Measure, grams, kilograms} from "safe-units"

interface IProduct {
    Name: string
}
interface ITescoOrderedProduct {
    id : number,
    title : string,
    link : string,
    category : string
    categoryLink : string
}

interface ISpoonQuantity {
    type: "spoon",
    value: number
}

interface IWeight {
    
}

enum WeightUnit { Kilogram, Gram} 

interface IWeightQuantity {
    type: "weight",
    value: number,
    unit: WeightUnit
}

enum VolumeUnit {Mililiter}

interface IVolumeQuantity {
    type: "volume",
    value: number,
    unit: VolumeUnit
}

interface IOtherQuantity {
    type: "other",
    value: string
}

type Quantity = IWeightQuantity | IVolumeQuantity | IOtherQuantity

module Quantity {
    export function scale(quantity : Quantity, scale : number) : Quantity {
        switch(quantity.type){
            case "volume": return {type: "volume", unit: quantity.unit, value: quantity.value * scale}
            case "weight": return {type: "weight", unit: quantity.unit, value: quantity.value * scale}
            case "other": return {type: "other", value: quantity.value + " * " + scale}
        }
    }
}

interface IRecipeIngredient {
    Product : IProduct,
    AlternativeProducts: IProduct[],
    Quantity : Quantity
}

interface IRecipe {
    Ingredients : IRecipeIngredient[]
}

function ProductsManager() {
    let x = Measure.of(30, grams)

    const [_products, loading, _]: [IProduct[] | undefined, boolean, unknown] = useObjectVal<IProduct[] | undefined>(productsRef);
    const products = _products || []
    const [name, setName] = useState('')

    function onAdd(e: FormEvent) {
        const product: IProduct = {Name: name}
        productsRef.set([...products, product]).then(() => {
                setName('');
            })
        e.preventDefault()
    }

    function handleName(e: any) {
        setName(e.target.value)
    }

    function handleRemove(toRemove: IProduct) {
        const newProducts = products.filter(p => p !== toRemove)
        productsRef.set(newProducts)
    }

    return <>
        {loading ? <Spinner animation='border'/>
            :
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Foo</th>
                </tr>
                </thead>
                <tbody>
                {products.map(p =>
                    <tr key={p.Name}>
                        <td>{p.Name}</td>
                        <td><Button variant='outline-warning' onClick={() => handleRemove(p)}>Remove</Button></td>
                    </tr>
                )}
                </tbody>
            </Table>
        }
        <Form onSubmit={onAdd}>
            <Form.Row>
                <Col xs='auto'>
                    <Form.Control type='text' placeholder='Product name' value={name} onChange={handleName} />
                </Col>
                <Col xs='auto'>
                    <Button variant='primary' type='submit'>Add</Button>
                </Col>
            </Form.Row>
        </Form>
    </>
}

function App() {
    return (
        <div>
            <Tabs>
                <Tab eventKey='products' title='Products'>
                    <ProductsManager/>
                </Tab>
            </Tabs>
        </div>
    );
}

export default App;
