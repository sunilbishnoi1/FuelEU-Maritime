# What I learned using AI agents

While using AI agents throughout this project, I've observed that they are still not perfect to fix bugs or implement features autonomously. They work great as assistants but need constant human supervision. The biggest lesson was understanding each agent's strengths - GitHub Copilot is good at understanding architectural patterns and generating boilerplate code, and Claude is great at detailed planning and documentation but sometimes over-engineers solutions.

I also learned that agents can get stuck in loops when debugging. There were moments when Copilot kept suggesting the same fix repeatedly despite errors, and that's when I had to step in manually.

Another crucial realization was about prompt engineering. Vague prompts like "fix the repository" yielded generic results, but specific prompts like "refactor routes_repository to remove business logic and only handle data access" produced much better outcomes. The more context and constraints I provided upfront, the less back-and-forth correction was needed.

# Efficiency gains vs manual coding

The efficiency gains were significant but not as dramatic as I initially expected. Writing all the repository boilerplate code, database queries, and error handling for five different repositories would've been tedious and time-consuming. Copilot handled the repetitive parts while I focused on the actual business logic.

However, the time saved wasn't purely additive because I still needed to review every single line of generated code, test it thoroughly, and often refactor it to match the project's specific requirements. For instance, the pooling allocation logic from Gemini looked correct at first glance, but testing with actual data revealed it didn't handle surplus reduction properly. Fixing that manually probably took as long as writing it from scratch would have, but at least I had a working starting point.

Where agents truly performed good was in generating comprehensive documentation and design plans. Claude's detailed frontend design specification would've taken me hours to write manually, and I probably wouldn't have been as thorough about defining the color palette, typography scales, component variants, and accessibility requirements. That document became a solid reference throughout the UI implementation phase.

The real efficiency gain came from parallelizing my thinking. While Copilot generated repository code, I could simultaneously think about service layer architecture. While working on generating test cases I could plan the API endpoints. This parallel processing effectively compressed what would've been sequential tasks into overlapping work streams, probably saving 30-40% of total development time despite the overhead of reviewing and correcting agent outputs.

# Improvements I'd make next time

While I wasn't able to dedicate the amount of time I actually wanted to give to this project (due to other commitments), I would have otherwise made the UI better as it is currently very basic and functional but not polished. There are still some alignment issues in the pooling tab, the charts in the compare section could be more interactive, and the responsive design needs work on mobile devices. The stats cards look decent but could use some animation and better data visualization.

If talking about how I would use AI agents better in future, I'll make sure to maintain separate chat contexts for different types of tasks. Mixing architecture discussions with debugging sessions in the same conversation made agents lose focus and start suggesting irrelevant fixes. I'd also document the exact context and files shared with each agent so I can reproduce successful patterns and avoid repeating mistakes.

Currenly test cases are only implemented for backend, I would have write test cases for frontend as well if i would have got some time.

Another major improvement would be creating a stricter prompt template for repository and service layer changes. Something like: "Remove all business logic, keep only data access, add consistent error handling, create private mapping methods" as a checklist. This structured approach would've reduced the back-and-forth corrections and made the agent outputs more consistent across different files.

I'd also invest more time upfront in creating detailed domain models and use case documents before jumping into code generation. Agents work much better when they have clear specifications to work from rather than figuring things out incrementally through conversation. Having that FuelEU Maritime compliance rulebook explicitly documented/summarized would've prevented the agents from missing critical validation rules in the pooling and banking services.

Lastly, I should've used version control more strategically with agent-generated code. Instead of accepting large chunks of generated code directly, I could've asked agents to generate smaller, incremental changes that are easier to review and rollback if needed. Creating feature branches for each agent-assisted task would've made it safer to experiment with different approaches without risking the main codebase.