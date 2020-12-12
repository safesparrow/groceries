import React, {FormEvent, useState} from 'react'
import './App.css';
import './Firebase';
import {Button, Col, Form, Spinner, Table, Tabs} from 'react-bootstrap'
import Tab from "react-bootstrap/Tab";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ProductsManager, IProduct} from "./Products";
import {useObjectVal} from "react-firebase-hooks/database";
import {productsRef} from "./Firebase";

/**
 * Basic info about a recipe
 */
interface ISimpleRecipe {
    id : number
    title : string
    recipe : string
}
//
// function Recipies() {
//
//         const [_products, loading, _]: [IProduct[] | undefined, boolean, unknown] = useObjectVal<IProduct[] | undefined>(productsRef);
//         const products = _products || []
//         const [name, setName] = useState('')
//
//         function onAdd(e: FormEvent) {
//             const product: IProduct = {Name: name}
//             productsRef.set([...products, product]).then(() => {
//                 setName('');
//             })
//             e.preventDefault()
//         }
//
//         function handleName(e: any) {
//             setName(e.target.value)
//         }
//
//         function handleRemove(toRemove: IProduct) {
//             const newProducts = products.filter(p => p !== toRemove)
//             productsRef.set(newProducts)
//         }
//
//         return <>
//             {loading ? <Spinner animation='border'/>
//                 :
//                 <Table striped bordered hover>
//                     <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Foo</th>
//                     </tr>
//                     </thead>
//                     <tbody>
//                     {products.map(p =>
//                         <tr key={p.Name}>
//                             <td>{p.Name}</td>
//                             <td><Button variant='outline-warning' onClick={() => handleRemove(p)}>Remove</Button></td>
//                         </tr>
//                     )}
//                     </tbody>
//                 </Table>
//             }
//             <Form onSubmit={onAdd}>
//                 <Form.Row>
//                     <Col xs='auto'>
//                         <Form.Control type='text' placeholder='Product name' value={name} onChange={handleName}/>
//                     </Col>
//                     <Col xs='auto'>
//                         <Button variant='primary' type='submit'>Add</Button>
//                     </Col>
//                 </Form.Row>
//             </Form>
//         </>
// }

function App() {
    return (
        <div>
            <Tabs>
                <Tab eventKey='products' title='Products'>
                    <ProductsManager/>
                    {/*<Recipies />*/}
                </Tab>
            </Tabs>
        </div>
    );
}

export default App;
