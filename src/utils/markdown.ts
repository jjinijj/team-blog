export const parseMarkdown = (text:string) : string => {
    let result = text;

    // **굵게** -> <strong>굵게</strong>
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // *기울임* -> <em>기울임</em>
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
    //__밑줄__ -> <u>밑줄</u>
    result = result.replace(/\__(.+?)\__/g, '<u>$1</u>');
    // 줄바꿈 -> <br>
    result = result.replace(/\n/g, '<br>');

    return result;
};