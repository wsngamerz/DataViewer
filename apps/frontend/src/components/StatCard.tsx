type Statistic = {
    name: string;
    value: string;
};

type StatCardProps = {
    title: string;
    description: string;
    stats: Statistic[];
    colour?: string;
    textColour?: string;
};

export default function StatCard(props: StatCardProps) {
    return (
        <div
            className={`rounded-lg p-16 flex justify-center items-center drop-shadow-md ${
                !props.colour && 'bg-emerald-500'
            }`}
            {...(props.colour && { style: { backgroundColor: props.colour } })}>
            <div
                className={`${
                    props.textColour ? props.textColour : 'text-white'
                } mr-4 max-w-xs`}>
                <h2 className="font-bold mb-4 text-2xl">{props.title}</h2>
                <span className="font-normal">{props.description}</span>
            </div>

            <div className="flex-grow flex max-w-2xl">
                {props.stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white p-4 flex-1 shrink-0 rounded-lg m-2 aspect-square flex items-center drop-shadow-md">
                        <div className="flex flex-col">
                            <span className="font-normal mb-2">
                                {stat.name}
                            </span>
                            <span className="font-black text-3xl">
                                {stat.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
