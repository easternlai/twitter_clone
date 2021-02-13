const Comment = require('../models/Comment');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports.formatCloudinaryUrl = (url, size, thumb) => {
    const splitUrl = url.split('upload/');
    splitUrl[0] += `upload/${
        size.y && size.z ? `x_${size.x},y_${size.y},` : ''
    }w_${size.width},h_${size.height}${thumb && ',c_thumb'}/`;
    const formattedUrl = splitUrl[0] + splitUrl[1];
    return formattedUrl;
};

module.exports.retrieveComments = async (tweetId, offset, exclude = 0) => {
    try {
            const commentsAggregation = await Comment.aggregate([
                {
                    $facet: {
                        comments:[
                            {
                                $match: {tweet: ObjectId(tweetId)},
                            },
                            { $sort: { date: -1 }},
                            { $skip: Number(exclude)},
                            { $sort: { date: 1}},
                            { $skip: Number(offset)},
                            { $limit: 10 },
                            { $lookup: {
                                from: 'users',
                                localField: 'author',
                                foreignField: '_id',
                                as: 'author',
                                },
                            },
                            {$unwind: '$author'},
                            {
                                $unset: [
                                    'author.password',
                                    'author.email',
                                ]
                            }
                        ], 
                        commentCount: [
                            {
                                $match: {
                                    tweet: ObjectId(tweetId),
                                }
                            },
                            {$group: { _id: null, count: {$sum: 1}}}
                        ]
                    }
                }
            ]);
            return commentsAggregation[0];
    } catch (err) {
        throw new Error(err);
    }
};