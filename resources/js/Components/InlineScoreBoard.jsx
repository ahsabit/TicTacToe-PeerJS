export default function InlineScoreBoard( {playerOneScore, playerTwoScore}) {
    return (
        <div className='mx-auto w-[358px] shadow-2xl rounded-2xl pt-2 pb-4 bg-gray-100'>
            <h2 className='w-full text-center font-bold text-xl mb-1'>Score</h2>
            <div className='w-full flex flex-row font-bold text-lg'>
                <span className='w-full text-center'>{playerOneScore}</span>
                <span>:</span>
                <span className='w-full text-center'>{playerTwoScore}</span>
            </div>
        </div>
    );
};