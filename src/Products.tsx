import {useObjectVal} from "react-firebase-hooks/database";
import {productsRef} from "./Firebase";
import React, {FormEvent, useState} from "react";
import {Button, Col, Form, Spinner, Table} from "react-bootstrap";
import {Quantity} from "./Quantity";

export interface IProduct {
    Name: string
}

interface ITescoOrderedProduct {
    id: number,
    title: string,
    link: string,
    category: string
    categoryLink: string
}

interface IRecipeIngredient {
    Product: IProduct,
    AlternativeProducts: IProduct[],
    Quantity: Quantity
}

interface IRecipe {
    Ingredients: IRecipeIngredient[]
}

export function ProductsManager() {
    const [_products, loading, error]: [IProduct[] | undefined, boolean, any] = useObjectVal<IProduct[] | undefined>(productsRef);
    
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
        {error}
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
                    <Form.Control type='text' placeholder='Product name' value={name} onChange={handleName}/>
                </Col>
                <Col xs='auto'>
                    <Button variant='primary' type='submit'>Add</Button>
                </Col>
            </Form.Row>
        </Form>
    </>
}