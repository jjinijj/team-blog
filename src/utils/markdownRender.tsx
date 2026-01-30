import { parseMarkdown, parseInline } from "./markdown";

export const MarkdownRenderer = ({markdown}:{markdown:string}) => {
    const blocks = parseMarkdown(markdown);

    return(
        <>
            {blocks.map((block, i) => {
                switch(block.type){
                    case "h1":
                        return <h1 key = {i}>{renderInline(block.value)}</h1>
                    case "h2":
                        return <h2 key = {i}>{renderInline(block.value)}</h2>                        
                    case "h3":
                        return <h3 key = {i}>{renderInline(block.value)}</h3>
                    case "h4":
                        return <h4 key = {i}>{renderInline(block.value)}</h4>                        
                    case "blockquote":
                        return (
                            <blockquote key={i} className="border-l-4 border-blue-500 pl-4 py-2 my-4 text-gray-600 italic bg-gray-50">
                                {renderInline(block.value)}
                            </blockquote>
                        );
                    case "ul":
                        return (
                            <ul key={i} className="list-disc list-inside my-4 space-y-2">
                                {block.value.map((item, idx) => (
                                    <li key={idx} className="text-gray-800">
                                        {renderInline(item)}
                                    </li>
                                ))}
                            </ul>
                        );
                    case "ol":
                        return (
                            <ol key={i} className="list-decimal list-inside my-4 space-y-2">
                                {block.value.map((item, idx) => (
                                    <li key={idx} className="text-gray-800">
                                        {renderInline(item)}
                                    </li>
                                ))}
                            </ol>
                        );
                    case "checklist":
                        return (
                            <ul key={i} className="space-y-2 my-4">
                                {block.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={item.checked}
                                            readOnly
                                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-0"
                                        />
                                        <span className={item.checked ? 'line-through text-gray-400' : 'text-gray-800'}>
                                            {renderInline(item.text)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        );
                    case "hr":
                        return <hr key={i} className="my-8 border-t-2 border-gray-200" />;
                    case "p":
                        return <p key = {i}>{renderInline(block.value)}</p>                        
                    case "code":
                        return (
                            <pre key={i} className="bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto">
                                <code>{block.value}</code>
                            </pre>
                        );
                    case "table":
                        return (
                            <div key={i} className="my-6 overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {block.headers.map((header, idx) => (
                                                <th 
                                                    key={idx}
                                                    className="border border-gray-300 px-4 py-2 font-semibold text-gray-700"
                                                    style={{ textAlign: block.align[idx] || 'left' }}
                                                >
                                                    {renderInline(header)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {block.rows.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-gray-50">
                                                {row.map((cell, cellIdx) => (
                                                    <td 
                                                        key={cellIdx}
                                                        className="border border-gray-300 px-4 py-2 text-gray-800"
                                                        style={{ textAlign: block.align[cellIdx] || 'left' }}
                                                    >
                                                        {renderInline(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                }
            })}
        </>
    )
}

const renderInline = (text:string) : React.ReactNode[] => {
    const nodes = parseInline(text);

    return nodes.map((node, i) => {
        switch(node.type){
            case "text":
                return node.value;
            case "strongAndEm":
                return (
                <strong key = {i}>
                    <em>{node.value}</em>
                </strong>);
            case "strong":
                return <strong key = {i}>{node.value}</strong>
            case "em":
                return <em key = {i}>{node.value}</em>
            case "u":
                return <u key = {i}>{node.value}</u>
            case "code":
                return <code key ={i} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">{node.value}</code>
            case "link":
                return (
                    <a 
                    key={i} 
                    href={node.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                    >
                        {node.value}
                    </a>
                );
            case "image":
                return (
                    <img 
                        key={i} 
                        src={node.url} 
                        alt={node.value}
                        className="max-w-full h-auto rounded-lg my-4"
                    />
                );
            default:
                return null;
        }
    })
}
