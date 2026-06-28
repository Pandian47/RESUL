/**
 * ResKendoGridDocs - Documentation Page
 *
 * Automatically generated component documentation using metadata from config.js.
 * Demonstrates the capabilities, props, and code implementation of ResKendoGrid.
 */
import { useState } from 'react';
import ResKendoGrid from './index';
import { GRID_CONFIG, FEATURE_MATRIX, PROPS_METADATA } from './config';

const SampleData = [
    { id: 1, name: 'Alice Smith', age: 28, status: 'Active', joinedDate: '03 Jun 2026' },
    { id: 2, name: 'Bob Johnson', age: 34, status: 'Inactive', joinedDate: '15 Jan 2026' },
    { id: 3, name: 'Charlie Brown', age: 41, status: 'Active', joinedDate: '22 Nov 2026' },
    { id: 4, name: 'Diana Prince', age: 29, status: 'Pending', joinedDate: '10 May 2026' },
    { id: 5, name: 'Evan Wright', age: 37, status: 'Active', joinedDate: '30 Mar 2026' },
    { id: 6, name: 'Fiona Gallagher', age: 25, status: 'Active', joinedDate: '01 Sep 2026' },
];

const SampleColumns = [
    { field: 'id', title: 'ID', width: '80px', filter: 'numeric' },
    { field: 'name', title: 'Name', filter: 'text' },
    { field: 'age', title: 'Age', width: '120px', filter: 'numeric' },
    { field: 'status', title: 'Status', filter: 'text' },
    {
        field: 'joinedDate',
        title: 'Joined Date',
        filter: 'text',
        cell: (props) => (
            <td>{props.dataItem.joinedDate}</td>
        ),
    },
];

const ResKendoGridDocs = () => {
    const [activeTab, setActiveTab] = useState('preview');

    const renderPreview = () => (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '20px' }}>Live Preview (Advanced Variant)</h4>
            <ResKendoGrid
                data={SampleData}
                columns={SampleColumns}
                variant="advanced"
                noBoxShadow={false}
                style={{ height: '400px' }}
            />
        </div>
    );

    const renderProps = () => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                        <th style={{ padding: '12px' }}>Prop Name</th>
                        <th style={{ padding: '12px' }}>Type</th>
                        <th style={{ padding: '12px' }}>Default</th>
                        <th style={{ padding: '12px' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {PROPS_METADATA.map((prop, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{prop.name}</td>
                            <td style={{ padding: '12px', color: '#d1569e' }}>{prop.type}</td>
                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>{prop.default}</td>
                            <td style={{ padding: '12px' }}>{prop.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderFeatures = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {FEATURE_MATRIX.map((feature, index) => (
                <div
                    key={index}
                    style={{
                        padding: '12px',
                        border: '1px solid #eee',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: feature.supported ? '#f0fdf4' : '#fef2f2',
                    }}
                >
                    <span>{feature.feature}</span>
                    <span style={{ color: feature.supported ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        {feature.supported ? '✓ Supported' : '✕ Not Supported'}
                    </span>
                </div>
            ))}
        </div>
    );

    const renderCode = () => (
        <div style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'Consolas, monospace', fontSize: '14px' }}>
                {`import React from 'react';
import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';

const MyComponent = () => {
    const data = [...];
    const columns = [...];

    return (
        <ResKendoGrid
            variant="advanced"
            data={data}
            columns={columns}
            isDataStateRequired={false}
            noBoxShadow={false}
        />
    );
};

export default MyComponent;`}
            </pre>
        </div>
    );

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <h1 style={{ color: '#111', marginBottom: '10px' }}>{GRID_CONFIG.componentName}</h1>
                <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
                    A consolidated Kendo Grid wrapper supporting multiple variants (default, custom, advanced, grouped).
                    Automatically replaces legacy grid components and provides consistent styling via the Design System.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['preview', 'props', 'features', 'code'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: activeTab === tab ? '#0043ff' : '#f4f4f4',
                            color: activeTab === tab ? '#fff' : '#333',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            textTransform: 'capitalize',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', minHeight: '400px' }}>
                {activeTab === 'preview' && renderPreview()}
                {activeTab === 'props' && renderProps()}
                {activeTab === 'features' && renderFeatures()}
                {activeTab === 'code' && renderCode()}
            </div>
        </div>
    );
};

export default ResKendoGridDocs;
