﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eru.Server.Data.Models;
using Eru.Server.Dtos;
using Eru.Server.Exceptions;
using Eru.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace Eru.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostTagsController : ControllerBase
    {
        private readonly PostTagService _postTagService;

        public PostTagsController(PostTagService postTagService)
        {
            _postTagService = postTagService;
        }

        // GET: api/PostTags
        [HttpGet]
        public async Task<ActionResult<ResultOutDto<IEnumerable<PostTag>>>> GetPostTags()
        {
            return Ok(ResultOutDtoBuilder.Success(await _postTagService.GetAll()));
        }


        [HttpPost]
        public async Task<ActionResult<ResultOutDto<PostTag>>> PostPostTags(
            [FromBody] TagCreateInDto createOptions)
        {
            try
            {
                return Ok(ResultOutDtoBuilder.Success(await _postTagService.Create(createOptions)));
            }
            catch (ExistedConflictException e)
            {
                return Conflict(ResultOutDtoBuilder.Fail<PostTag>(e, "Tag name existed."));
            }
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<ActionResult<ResultOutDto<object>>> PutPostTags(
            [FromRoute] int id,[FromBody] PostTag tag
            )
        {
            if (id != tag.Id)
            {
                return BadRequest(ResultOutDtoBuilder.Fail<object>(new FormatException(), "error id format"));
            }

            try
            {
                await _postTagService.Update(tag);
                return NoContent();
            }
            catch (NotExistedException e)
            {
                return NotFound(ResultOutDtoBuilder.Fail<object>(e, "Not exist."));
            }
            catch (ExistedConflictException e)
            {
                return Conflict(ResultOutDtoBuilder.Fail<object>(e, "Conflict name."));
            }
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult<ResultOutDto<object>>> DeletePostTags(
            [FromRoute] int id)
        {
            try
            {
                await _postTagService.Remove(id);
                return NoContent();
            }
            catch (NotExistedException e)
            {
                return NotFound(ResultOutDtoBuilder.Fail<object>(e, "Not exist."));
            }
        }
    }
}