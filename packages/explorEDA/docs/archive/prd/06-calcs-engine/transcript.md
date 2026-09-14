“I want to discuss designing and building a new system.”
00:03
ChatGPT said:
Sure! What kind of system are you planning to design and build? Are you focusing on a web application, a backend service, or something else?

You said:
“So it's a part of a data visualization program that I'm making. Specifically, I wanted to talk through the calculation and transformation layer that takes raw data and then turns it into the data object that the visualizations see. And for this discussion, I want you to initially ask me what are the features of it, and then we're going to talk through what it'll try to make.”
00:28
ChatGPT said:
Memory updated
Got it! What features are you planning to include in your calculation and transformation layer?

You said:
“So the calculation and transformation layer lets the user either clean up data or to do various sorts of math functions or other expressions on the data. So for example, the user will be able to create arbitrary expressions, A plus B, C plus D, that kind of thing. So that kind of expression, general math, addition, subtraction, multiplication, division, exponentiation. The user will also have access to all of JavaScript's built-in functions. So they can have access to trig, min, max, floor, seal, actually not min and max, but floor, ceiling, those functions. Yeah, ask me questions about that.”
00:52
ChatGPT said:
To clarify, the user will be able to define arbitrary expressions involving basic math operations and JavaScript functions.

How do you plan to handle user-defined expressions?
Will you include a parser for these expressions, or are you relying on existing libraries?
How will you ensure performance, especially with complex transformations?

You said:
“Yeah, so with respect to parsing, I'll build a parser. I'll use, well, I guess I'll use Ohm.js and then build a parser on top of that. And then I'll also support various sorts of common manipulations where I know the user wants to do them, but to help them avoid having to type out various expressions and stuff. So date formatting, I'll give the user access to the D3 format library. Other date extraction picking type functionality, so getting the year, month, day as numbers, quarter, week number, that kind of stuff. I'll have some functionality for that. Computing the z-score from a row-wide z-score, an element against its column. So do that transformation.”
00:57
ChatGPT said:
Memory updated
That sounds like a robust plan! Are you considering any specific performance optimizations or caching strategies for frequently used transformations?

You said:
“Um, with respect to performance, the data layer that this is going into already caches the results. So, uh, I guess I'll get caching for free. I'm not too worried about the performance of, uh, the functions. I mean, ultimately, if the user wants to do them, they want to do them. Uh, and if their computer can't handle it, they'll do something different. Um, so I'm not too worried about specific, uh, performance limits.”
00:27
ChatGPT said:
Memory updated
That makes sense. With caching already handled, you can focus more on flexibility and ease of use. Do you have any specific challenges or concerns about integrating Ohm.js or any other part of this layer?

You said:
“No, I've worked with OEM before, so I'm not worried about that. Let's talk through additional functions that are available. So in the function layer, I want to make available.”
00:12
ChatGPT said:
Got it!

You said:
“Self-organizing.”
00:01
ChatGPT said:
Sounds good. Providing self-organizing features can be powerful. Do you plan on implementing any machine learning techniques for those features, or do you have something else in mind?

You said:
“Yeah, so I was going to do self-organizing maps or Kohonen maps. I was also going to allow the user to compute principal components and to extract the first and second components, that way they can make a plot. I'll have some sort of function that lets the user compute a UMAP or a t-SNE transformation. Yeah, those are initially the fancier functions.”
00:28
ChatGPT said:
Memory updated
Those advanced functions will definitely add a lot of value. Have you considered how you'll handle the computational load for UMAP and t-SNE, given their complexity?

You said:
“I don't know, just run them on the user's machine. Again, I've done it before on datasets that are 1,000, 10,000, 100,000 rows. It can be done. I guess if it can't be done, maybe that's the kind of thing I could offload to the server and then charge the user to get access to it, something like that.”
00:19
ChatGPT said:
Memory updated
That sounds like a reasonable approach. Starting with client-side computation and then offering a server-side option for more demanding cases could provide flexibility. Do you have any other advanced functions in mind?

You said:
“Not sure about advanced, but let's talk through regression type functionality. So I want the user to be able to compute regressions on incoming data, and then get access to either a computed result or a residual. So I'll implement various sorts of regression, linear, polynomial, that kind of stuff. And if there's a library that supports it, or maybe I'll do the more advanced, like a NOVA factored analysis kind of stuff, I'm not sure what's available on that front.”
00:32
ChatGPT said:
Memory updated
That will add a lot of analytical power to your system. Have you thought about how users might visualize these regression results? For example, overlaying regression lines on scatter plots or displaying residuals in a specific way?

You said:
“Um, yeah, so this calculation stuff is tied to, like, a whole visualization engine. The scatter chart already has regression functionality that does the visuals, so this is really just to give the user access to the number from a regression if they wanted that. Most likely they would use that number in another calculation, or maybe they do a plot of, like, residual versus some other variable, and so that kind of scatter plot against the residual might be common.”
00:30
ChatGPT said:
Memory updated
That makes a lot of sense. Giving users access to those regression numbers will provide them with more flexibility for custom analyses. Is there anything else you're considering adding to this layer, or any other integration challenges you want to discuss?

You said:
“talk through what other sorts of...”
00:02
ChatGPT said:
Sure! What other

You said:
“Data extraction, data transformation functions are common in this realm.”
00:03
ChatGPT said:
Some common data extraction and transformation functions include:

Date Manipulation:

Extracting components like year, month, day, or week.
Calculating the difference between dates.
Formatting dates in various styles.
String Operations:

Concatenation.
Substring extraction.
Pattern matching or replacement using regex.
Numerical Transformations:

Normalization or standardization.
Logarithmic transformations.
Aggregations like mean, median, or sum.
Categorization:

Binning or bucketing numeric values.
Creating dummy variables for categorical data.
Any of these sound useful for your layer?

You said:
“Uh, yeah, honestly, all of those sound useful. Um, definitely the normalization ones, the binning, the bucketing, all of those sound good. Uh, date processing, string processing, all of those sound good as well. Um, yeah, all those make sense.”
00:15
ChatGPT said:
Memory updated
Great! Incorporating those functions will provide users with powerful tools for data manipulation. Is there anything else you'd like to discuss or any specific challenges you foresee with these additions?

You said:
“With respect to these calculations, let's keep talking about additional calculations to do.”
00:03
ChatGPT said:
Sure! Some additional calculations you might consider include:

Statistical Summaries:

Calculating variance and standard deviation.
Computing percentiles or quartiles.
Advanced Aggregations:

Rolling averages or moving averages.
Post-processing to handle missing values (e.g., imputation).
Transformations:

Logarithmic or exponential transformations.
Polynomial transformations.
Feature Engineering:

Interaction terms.
Dummy variable encoding.
Do any of these sound like they might be relevant for your system?

You said:
“On the statistical front, let's talk through, I call it a group aggregation calculation. This is where the user supplies fields to group by and then a single field to aggregate on. So this will take a source row of data, determine which group it belongs into, and then assign to all rows in that group the same result. So basically it's the math of a pivot table, at least the row part of a pivot table, returned as a number. That way the group values can be used in other calculations.”
00:37
ChatGPT said:
Memory updated
That sounds like a great way to handle group aggregations. Are you considering any specific aggregation functions, like sum, average, or count?

You said:
“But yeah, all the typical ones, SUM, COUNT, MIN, MAX, AVERAGE, COUNTUNIQUE, maybe percentiles.”
00:11
ChatGPT said:
Memory updated
That's a solid set of aggregation functions. Implementing those will definitely give users a lot of flexibility. Anything else you'd like to cover?

You said:
“Yeah, let's talk through an additional calculation. We'll call it rank, and it will take a column and then return the row's rank in that column relative to the rest. So 0, 1, 2, 3, or probably 1, 2, 3, 4, n. And then the rank will also support grouping. So the user can select fields to group by before they compute the rank. Then that would give the rank within the group.”
00:25
ChatGPT said:
Memory updated
Adding a ranking calculation with grouping support is a great idea. It will definitely help users understand the relative standing of their data. Anything else you'd like to dive into?

You said:
“Um, yeah, given the group ag and the rank, uh, is there anything else that's kind of related to that?”
00:05
ChatGPT said:
One related calculation could be percentile ranking, which assigns a percentile rank to each row within its group. This provides a relative standing similar to ranks but in percentile terms.

Another could be cumulative sums or counts, which might be useful for time series or ordered data, providing a running total.

Would either of these be helpful?

You said:
“Yeah, both of those would be good. Percentiles instead of the raw rank, that's good. Or, honestly, just a normalized rank, like divide the rank by the count. And then the cumulative sum and the running total cumulative counts, those would be good to have inside the rank feature.”
00:16
ChatGPT said:
Memory updated
Incorporating those will make your rank feature even more versatile. Anything else you'd like to discuss or any other calculations you're considering?
