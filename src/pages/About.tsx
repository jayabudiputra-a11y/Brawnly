const About = () => {
  return (
    <div className="container mx-auto py-8 prose dark:prose-invert transition-colors duration-300">
      <h1 className="font-black">
        <span className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          About Brawnly
        </span>
      </h1>

      <p className="text-lg font-bold leading-relaxed flex flex-wrap gap-x-1">
        <span className="text-red-500">This</span>
        <span className="text-orange-500">blog</span>
        <span className="text-yellow-600 dark:text-yellow-400">is</span>
        <span className="text-green-500">part</span>
        <span className="text-teal-500">of</span>
        <span className="text-blue-500">the</span>

        <span className="bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent px-1">
          LGBTQ+ community,
        </span>

        <span className="text-indigo-500 dark:text-indigo-400">celebrating</span>
        <span className="text-purple-500 dark:text-purple-400">muscular</span>
        <span className="text-pink-500">bodies,</span>
        <span className="text-red-500">mindset,</span>
        <span className="text-orange-500">and</span>
        <span className="text-green-500">wellness.</span>

        <span className="w-full block mt-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent italic">
          Join me for inspiration and motivation!
        </span>
      </p>
    </div>
  );
};

export default About;
